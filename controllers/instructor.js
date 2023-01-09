import User from "../models/user";
import Course from "../models/course";
import querystring from "querystring";

const stripe = require("stripe")(process.env.STRIPE_SECRET);

export const makeInstructor = async (req, res) => {
  try {
    // 1. find user from db
    const user = await User.findById(req.auth._id).exec();
    console.log("user", user);
    // 2. if user dont have a stripe account id yet , then create new
    if (!user.stripe_account_id) {
      const account = await stripe.accounts.create({ type: "standard" });
      console.log("accountid", account.id);
      user.stripe_account_id = account.id;
      user.save();
    }
    console.log("user2", user);
    // 3. create account link based on account if (for frontend to complete onboarding)
    let accountLink = await stripe.accountLinks.create({
      account: user.stripe_account_id,
      refresh_url: process.env.STRIPE_REDIRECT_URL,
      return_url: process.env.STRIPE_REDIRECT_URL,
      type: "account_onboarding",
    });
    console.log("accountlink1", accountLink);
    // 4. pre fill any info such as email(optional), then send url response to fortend
    accountLink = Object.assign(accountLink, {
      "stripe_user[email]": user.email,
    });
    console.log("accountlink2", accountLink);
    // 5. then send the account link as response to frontend
    res.send(`${accountLink.url}?${querystring.stringify(accountLink)}`);
  } catch (err) {
    console.log("make inst err", err);
  }
};

export const getAccountStatus = async (req, res) => {
  try {
    const user = await User.findById(req.auth._id).exec();
    const account = await stripe.accounts.retrieve(user.stripe_account_id);
    console.log("stripe account", account);
    // return

    if (!account.charges_enabled) {
      return res.status(401).send("Unauthorized");
    } else {
      const statusUpdated = await User.findByIdAndUpdate(
        user._id,
        {
          stripe_seller: account,
          $addToSet: { role: "Instructor" },
        },
        { new: true }
      )
        .select("-password")
        .exec();

      // console.log()
      res.json(statusUpdated);
    }
  } catch (err) {
    console.log(err);
  }
};

export const currentInstructor = async (req, res) => {
  try {
    let user = await User.findById(req.auth._id).select("-password").exec();
    console.log("user ins", user);
    if (!user.role.includes("Instructor")) {
      return res.sendStatus(403);
    } else {
      res.json({ ok: true });
    }
  } catch (err) {
    console.log(err);
  }
};

export const instructorCourses = async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.auth._id })
      .sort({ created: 1 })
      .exec();
    return res.json(courses);
  } catch (err) {}
};
