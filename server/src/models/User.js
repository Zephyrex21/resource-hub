import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, trim: true, lowercase: true, index: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    avatarUrl: { type: String, default: '' },
  },
  { timestamps: true },
)

// Never let the hash leak to a client, even by accident (an errant
// console.log(user), a route that spreads a user doc into a response,
// etc.) — belt-and-suspenders on top of the controller already building
// its own explicit public-user shape.
userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.passwordHash
    return ret
  },
})

export default mongoose.model('User', userSchema)
