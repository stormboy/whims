
exports.show = function(req, res) {
	res.render('touch', {
		title : "Touch Interface",
	});
}

exports.showOld = function(req, res) {
	res.render('touch_old', {
		title : "Touch Interface",
	});
}
