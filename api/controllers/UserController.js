/**
 * UserController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const fs = require('fs');
// Base path
const appPath = sails.config.appPath;
const checkTime = time => time < 10 ? `0${time}` : `${time}`;

module.exports = {
  login: async (req, res) => {
    const request = req.allParams();
    const baseUrl = req.baseUrl;

    const Authorize = _.get(req.session, 'Authorize', null);
    const IsLogin = _.get(Authorize, 'IsLogin', 0);
    const TimeLoginAt = _.get(Authorize, 'TimeLoginAt', false);
    const TimeLogoutAt = _.get(Authorize, 'TimeLogoutAt', false);

    // Kiểm tra đã đăng nhập hay chưa
    if(IsLogin === 1 && TimeLoginAt < TimeLogoutAt) return res.ok(req.session.Authorize);
    else {
      // Đăng nhập đúng tài khoản hay không
      const userLogin =  await UserModel.login(request);
      const { UserId = null } = userLogin;
      let authorize = {};

      if(UserId) { 
        const timeLogin = new Date();
        const timeLoginMinute = timeLogin.getMinutes();
        const timeLoginHour = checkTime(timeLogin.getHours());
        const timeLoginMonth = checkTime(timeLogin.getMonth() + 1);
        const timeLoginDate = checkTime(timeLogin.getDate());
        const timeLoginYear = timeLogin.getFullYear();

        const logoutMinutue = timeLoginMinute + 120;
        const timeLogout = new Date(`${timeLoginYear}-${timeLoginMonth}-${timeLoginDate} ${timeLoginHour}:${timeLoginMinute}:00`);
        timeLogout.setMinutes(logoutMinutue);

        // Thời gian đăng nhập lần cuối gần nhất
        await UserModel.lastActiveLogin(UserId);

        // Thông tin đăng nhập
        const user = await UserModel.getUserInfo(UserId);
        const { Avatar, Gender } = user;
        let avatar = (Gender === 2) ? require('util').format('%s/images/modules/user/avatar-girl.jpg', baseUrl) : require('util').format('%s/images/modules/user/avatar-boy.jpg', baseUrl);
        if(Avatar && Avatar != 'NULL') { 
          const imagePath = `${appPath}\\assets\\images\\modules\\user\\${UserId}\\${Avatar}`;
          if(fs.existsSync(imagePath)) avatar = require('util').format('%s/images/modules/user/%s/%s', baseUrl, UserId, Avatar);
        }
        user.Avatar = avatar;
        
        // Kết quả trả về
        authorize = {
          IsLogin: 1,
          TimeLoginAt: timeLogin.getTime(),
          TimeLogoutAt: timeLogout.getTime(),
          TimeLogin: `${checkTime(timeLogin.getDate())}/${checkTime(timeLogin.getMonth() + 1)}/${timeLogin.getFullYear()} ${checkTime(timeLogin.getHours())}:${checkTime(timeLogin.getMinutes())}:${checkTime(timeLogin.getSeconds())}`,
          TimeLogout: `${checkTime(timeLogout.getDate())}/${checkTime(timeLogout.getMonth() + 1)}/${timeLogout.getFullYear()} ${timeLogout.getHours()}:${checkTime(timeLogout.getMinutes())}:${checkTime(timeLogout.getSeconds())}`,
          User: user,
          Staff: await UserModel.getStaffByUserId(UserId)
        }; 
      }

      req.session.Authorize = authorize;
      return res.ok(req.session.Authorize);
    }
  },
  
  logout: async (req, res) => {
    req.session.Authorize = null;
    return res.ok(req.session.Authorize);
  }
};

