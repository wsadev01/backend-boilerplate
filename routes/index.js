module.exports = (application) => {
	require('./login')(application)
	require('./user')(application)
}
