import User from "../models/user";

const { expressjwt: jwt } = require("express-jwt");

export const requireSignin = jwt({
  getToken: (req, res) => req.cookies.token,
  secret: process.env.JWT_SECRET,
  algorithms: ["HS256"],
});

// instructor middleware
export const isInstructor = async(req, res, next) => {
  try{
    const user = await User.findById(req.auth._id).exec()
    console.log("userekjfrlasjf", user)
    if(!user.role.includes("Instructor")) {
      return res.sendStatus(403)
    } else{
      next()
    }

  } catch(err){
    console.log(err)
  }
}



// const { expressjwt: jwt } = require("express-jwt");

// export const requireSignin = jwt({
//   getToken: (req, res) => {
//     console.log("req jwt", req.cookie.token);
//     req.cookie.token;
//   },
//   secret: process.env.JWT_SECRET,
//   algorithms: ["HS256"],
// });
