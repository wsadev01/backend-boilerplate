const mongoose = require('mongoose');

const availableRoles = ["guest", "user", "cm", "premium", "mod", "root"];
const UserSchema = new mongoose.Schema(
  {
  /* Your data */
    deleted: { type: Boolean, default: false },
		username: { type: String },
		password: { type: String, select: false },
		createdBy: { type: String, enum: [...availableRoles, "system"], required: true},
		rol: {
			type: String,
			default: "guest",
			enum: availableRoles,
		}
  },
  {
		timestamps: true,
  }
)

module.exports = mongoose.model('User', UserSchema);
