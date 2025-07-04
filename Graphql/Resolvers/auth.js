const bcrypt = require("bcrypt");
const User = require("../../model/user");
const jwt = require('jsonwebtoken')





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
            message:"created successfully"
          };
        } catch (err) {
          throw err;
        }
      },
      login :async ({email,password}) =>{
        try {
            const userExists  = await User.findOne({email : email })
            if(!userExists) throw new Error("the user dont exists...")
            
            const correctPass = await bcrypt.compare(password , userExists.password) ;
            if(!correctPass) throw new Error("wrong password")

            const jToken  = jwt.sign({userId : userExists.id , email : userExists.email} , 'secretKey' , {expiresIn : '2h'})


            return {
                userId : userExists.id ,
                token : jToken , 
                tokenExpiration : 2
            }
        } catch (error) {
            console.log(error)
            throw error
        }
      }
}