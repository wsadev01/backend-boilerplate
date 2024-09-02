// CONSTANTS
// Cache time is in hours, cookie time in minutes
const CACHE_TIME = 1000 * 60 * 60 * process.env.CACHE_TIME;
const COOKIE_TIME = 1000 * 60 * process.env.COOKIE_TIME;


// MODULES (Packages)
// dotenv for .env
require("dotenv").config();
// body-parser: For accesing POST requests in req.body
const bodyParser = require("body-parser");
// cookie-parser: Access cookies through req.cookies
const cookieParser = require("cookie-parser");
// compression: Compress HTTP responses using gzip or deflate
const compression = require("compression");
// cors: To enable CORS so we can access back-end from front-end
const cors = require("cors");
// express: express framework...
const express = require("express");
/**
 * helmet: Establish http headers for some well-known vulnerabilites
 * 01. Content-Security-Policy
 *			Helps prevent XSS, clickjacking and other code injection attacks.
 * 02. Cross-Origin-Embedder-Policy
 *			Controls cross-origin loading of resources, prevents embedding malicious content.
 * 03. Cross-Opener-Policy
 *			Ensures a new browsing context group is created, mitigatin certain cross-site
 *			attacks like cross-site leaks.
 * 04. Cross-Origin-Resource-Policy
 *			Prevents other sites from loading your resources, helping to protect your site from
 *			cross-origin attacks.
 * 05. Expect-CT
 *			Allows you to control the certificate transparency policy of your site, helps to detect
 *			fraudulent certificates.
 * 06. Referrer-POlicy
 *			Controls the information sent in the Referer header, limiting the data shared when
 *			users navigate to another site.
 * 07. Strict-Transport-Security (HSTS)
 *		Forces browsers to use HTTPS instead of HTTP, prevents MITM attacks.
 * 08. X-Content-Type-Options
 *			Prevents browsers from MIME-sniffing a response away from the declared Content-Type,
 *			reducing the risk of XSS attacks.
 * 09. X-DNS-Prefetch-Control
 *			Controls browser DNS prefetching, reducing risk of privacy performance issues.
 * 10. X-Download-Options
 *			Set the X-Download-Options header to prevent IExplorer from executing downloads in the
 *			site's context.
 * 11. X-Frame-Options
 *			Protects your site from clickjacking attacks by controlling wheter your site can be
 *			framed by other websites.
 * 12. X-Permitted-Cross-Domain-Policies
 *			Controls Adobe Flash and Acrobat cross-domain policies, which can help reduce the attack
 *			surface.
 * 13. X-XSS-Protection
 *			Enables the cross-site scripting (XSS) filter built into most browsers to prevent XSS attacks.
 */
const helmet = require("helmet");
// morgan: HTTP request logger, logs incoming requests in predefined format.
const logger = require("morgan");
// express-session: Provides session management, usually used along with passport.
const session = require("express-session");
// passport: Authentication middleware; Provides flexible and modular way to handle user auth, with
// various strategies, including OAuth, local, JWT, etc.
const passport = require("passport");
// connect-mongo: MongoDB session store for Express and Connect; It provides a way to store session
// data in a MongoDB, used for session persistence across server restarts.
const MongoStore = require("connect-mongo");

// MODULES (Built-in)
const fs = require("fs");
const http = require("http");
const path = require("path");


const appconf = require("./config/app");
const init = require('./init/index');

function initServer() {
  /**
   * Express configuration
   */
  const app = express();

  app.set("json spaces", 2);
  app.use(logger("dev"));

  app.use(
    express.static(path.join(__dirname, "public"), {
      maxAge: CACHE_TIME,
    })
  );

  /**
   * Error log management
   */

  const LOG_DIR = path.join(__dirname, process.env.DIR_LOG_ERROR);
  const LOG_FILE = path.join(LOG_DIR, process.env.FILE_LOG_ERROR);

  if (!fs.existsSync(LOG_DIR)) {
    console.log("\x1b[93m[**]\x1b[0m Creating logs directory")
    fs.mkdirSync(LOG_DIR, {recursive: true});
  }
  const errorLogStream = fs.createWriteStream(LOG_FILE, {flags: "a"});

  /**
   * Error handling, avoiding crash
   */
  process.on("uncaughtException", (err, req, res, next) => {
    let date = new Date().toISOString();
    console.error(`\x1b[91m.: [!] \x1b[0m(${date}) Error found, logging event... \x1b[91m[!] :.\x1b[0m`);
    console.error(err.stack);
    errorLogStream.write(`(${date}) ${err.message}\n${err.stack}\n--`);
    return;
  });

  /**
   * Helment security lib
   */
  app.use(helmet());

  /**
   * Response definition
   */
  app.use((req, res, next) => {
    res.success = (data, status) => {
      return res.status(status !== undefined ? status : 200).send({
        data: data !== undefined ? data : null,
        error: null,
      });
    };

    res.failure = (errorCode, errorMsg, status) => {
      return res.status(status !== undefined ? status : 500).send({
        data: data !== undefined ? data : null,
        error: {
          code: errorCode !== undefined ? errorCode : -1,
          message: errorMsg !== undefined ? errorMsg : "Unknown Error",
        },
      });
    };

    next();
  });

  /**
   * Compress middleware to gzip content
   */
  app.use(compression());

  /**
   * Require Mongo configuration
   */
  //require("./init/database");

  /**
   * Require local passport
   */
  require("./config/passport/local");

  /**
   * View engine setup
   */
  app.use(bodyParser.json({ limit: "24mb" }));
  // app.use(bodyParser.json());
  app.use(
    bodyParser.urlencoded({
      extended: false,
    })
  );
  app.use(cookieParser(appconf.db.main.name));

  app.use(
    session({
      name: appconf.db.main.name,
      secret: appconf.session.main.secret,
      saveUninitialized: true,
      resave: true,
      cookie: {
        maxAge: COOKIE_TIME,
        proxy: true,
        sameSite: "None",
        secure: true,
      },
      store: MongoStore.create({
				mongoUrl: appconf.db.main.mongostring,
        host: appconf.db.main.host,
        collection: "sessions",
        autoReconnect: true,
        clear_interval: 3600,
      }),
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  app.use(
    cors({
      credentials: true,
      origin: ["http://localhost:3000", "http://localhost:5173"],
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
      preflightContinue: false,
      optionsSuccessStatus: 204,
    })
  );

  //app.use(cors());

  /**
   * Routes
   */
  require("./routes/index")(app);

  /**
   * Disable server banner header
   */
  app.disable("x-powered-by");

  /**
   * Catch 404 and forward to error handler
   */
  app.use((req, res, next) => {
    var err = new Error("Not Found");
    err.status = 404;
    next(err);
  });

  /**
   * Error Handlers
   *
   * Development error handler
   * Will print stacktrace
   */
  if (process.env.NODE_ENV === "development") {
    app.use((err, req, res, next) => {
      res.status(err.status || 500);
      res.render("error", {
        message: err.message,
        error: err,
      });
    });
  }

  /**
   * Production error handler
   * No stacktraces leaked to user
   */
  app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.render("error", {
      message: err.message,
      error: {},
    });
  });

  /**
   * Firing Up express
   */
  app.set("port", appconf.port);

  http.createServer(app).listen(app.get("port"), () => {
    console.log(`${appconf.name} server listening on port ${appconf.port}`);
  });
}

init.db.mongo().then(initServer);
