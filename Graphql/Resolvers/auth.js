const bcrypt = require("bcrypt");
const User = require("../../model/user");






module.exports = {
      createUser: async ({ userInput }) => {
        try {
          const existingUser = await User.findOne({ email: userInput.email });
          if (existingUser) throw new Error("User already exists.");

          const hashedPass = await bcrypt.hash(userInput.password, 12);

          const user = new User({
            email: userInput.email,
            password: hashedPass,
          });

          const result = await user.save();
          return {
            ...result._doc,
            password: null,
            _id: result.id,
          };
        } catch (err) {
          throw err;
        }
      },



    
    }