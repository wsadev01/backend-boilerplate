const Users = require('../models/user');

exports.create = async (req, res) => {
	try {
		const newDoc = await Users(req.body).save();
		if (!newDoc) {
			return res.failure(process.env.EDBCREATE, "Internal error", 500);
		}
		return res.success(newDoc, 200);
	} catch(err) {
		console.error(err);
		return res.failure(process.env.JS_ERROR, "Internal error", 500);
	}
}

exports.read = async (req, res) => {
	try {
		const filter = {
			...(req.query.id ? {_id: req.query.id} : {}),
		  ...(req.query.username ? {username: new RegExp(req.query.username, 'i')} : {}),
		};
		let recordset;
		try {
			if (req.query.id) {
				recordset = await Users.findOne(filter).exec();
			} else {
				recordset = await Users.find(filter).exec();
			}
			return res.success(recordset, 200);
		} catch(err) {
			console.error(err);
			return res.failure(process.EDBREAD, "Internal DB error", 500);
		}
	} catch (err) {
		console.error(err);
		return res.failure(process.env.JS_ERROR, "Internal error", 500);
	}
}

exports.update = async (req, res) => {
	try {
		const filter = {
			_id: req.body.id,
		};
		const updatedDoc = await Users.findOneAndUpdate(filter, req.body, {returnDocument: "after"}).exec();
		if (!updatedDoc) {
			return res.failure(process.env.EDBUPDATE, "Internal DB error", 500);
		}
		return res.success(updatedDoc, 200);
	} catch (err) {
		console.error(err);
		return res.failure(process.env.JS_ERROR, "Internal error", 500);
	}
}

exports.remove = async (req, res) => {
	const filter = { _id: req.query.id };
	let docStatus;
	if (req.query.hard === 'true') {
		docStatus = await Users.findOneAndDelete(filter).exec();
	} else {
		docStatus = await Users.findOneAndUpdate(filter, {deleted: true}).exec();
		if (!docStatus) {
			return res.failure(process.env.EDBDELETE, "Internal DB error", 500);
		}
	}
	return res.success(docStatus, 200);
}

