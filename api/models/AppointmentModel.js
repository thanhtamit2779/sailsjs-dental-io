/**
 * AppointmentModel.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */
// get the client
// Checktime : 9 -> 09
const checkTime = time => time < 9 ? `0${time}` : `${time}`;
const fs = require('fs');
const appPath = sails.config.appPath;

module.exports = {
  tableName: 'appointment',
  attributes: {
    id: {
      type: 'number',
      autoIncrement: true,
      columnName: 'AppointmentId',
    },
    Note: {
      type: 'string',
      allowNull: true    
    },
    FromCustomerChannel: {
      type: 'number',
      allowNull: true    
    },
    AppointmentStatusId: {
      type: 'number',
    },
    AppointmentLabelId: {
      type: 'number',
    },
    AppointmentStatusNote: {
      type: 'string',
      allowNull: true    
    },
    CustomerId: {
      type: 'number',
      allowNull: false,
      required: true
    },
    CreatedAt: {
      type: 'number',
      allowNull: true
    },
    CreatedBy: {
      type: 'number',
      allowNull: true
    },
    EditedAt: {
      type: 'number',
      allowNull: true
    },
    EditedBy: {
      type: 'number',
      allowNull: true
    },
    StartAt: {
      type: 'number',
      allowNull: false,
      required: true
    },
    EndAt: {
      type: 'number',
      allowNull: false,
      required: true
    },
    AppointedTo: {
      type: 'number',
      //allowNull: true,
      defaultsTo: 0,
    },
    RelatedTo: {
      type: 'number',
      allowNull: true,
    },
    AtBranchId: {
      type: 'number',
      allowNull: true 
    }
  },

  _getAppointments: async function (req) {
    const request = req.allParams();
    const { 
      Keyword = '',
      Day = '',
      BranchId = null,
      DoctorId = null,
      AppointmentStatusIds = [],
      AppointmentLabelId = null
    } = request;

    /*===============================
    | SQL
    | =============================== 
    */
    const date = new Date();
    const year = date.getFullYear();
    const month = checkTime(date.getMonth() + 1);
    const day = checkTime(date.getDate());

    // Lấy ngày hiện tại
    // let fromDate = new Date(`${year}-${month}-${day} 00:00:00`);
    // let fromDateTimestamp = ~~((fromDate.getTime())/1000);
    // let toDate   = new Date(`${year}-${month}-${day} 23:59:59`);
    // let toDateTimestamp = ~~((toDate.getTime())/1000);

    // Mặc định 2019-07-27
    let fromDate = new Date(`2019-07-27 00:00:00`);
    let fromDateTimestamp = ~~((fromDate.getTime())/1000);
    let toDate   = new Date(`2019-07-27 23:59:59`);
    let toDateTimestamp = ~~((toDate.getTime())/1000);

    if(Day && Day !== '') {
      fromDate = new Date(`${Day} 00:00:00`);
      fromDateTimestamp = ~~((fromDate.getTime())/1000);
      toDate   = new Date(`${Day} 23:59:59`);
      toDateTimestamp = ~~((toDate.getTime())/1000);
    }

    let sql = `SELECT "a"."StartAt", 
    "a"."EndAt", 
    "a"."AppointmentId", 
    "a"."AppointmentStatusId", 
    "a"."AppointedTo", 
    "a"."CreatedBy", 
    "a"."CreatedAt", 
    "a"."EditedBy", 
    "a"."EditedAt", 
    "a"."AtBranchId", 
    "a"."AppointmentStatusNote", 
    "a"."Note", 
    "a"."CustomerId", 
    "a"."AppointmentLabelId"         
                FROM "public"."appointment" as "a"
                WHERE "a"."StartAt" >= ${fromDateTimestamp} AND "a"."StartAt" <= ${toDateTimestamp}`;

    if(BranchId > 0) {
      sql += ` AND "a"."AtBranchId" = ${BranchId}`;
    }

    if(DoctorId > 0) {
      sql += ` AND "a"."AppointedTo" = ${DoctorId}`;
    }

    if(AppointmentLabelId > 0) {
      sql += ` AND "a"."AppointmentLabelId" = ${AppointmentLabelId}`;
    }

    if(AppointmentStatusIds.length !== 0) {
      sql += ` AND "a"."AppointmentStatusId" IN (${ AppointmentStatusIds.join() })`;
    }

    if(Keyword.length > 2) {
      // Search By
      // 1. FullName
      // 2. CustomerCode
      // 3. PhoneNumber
      let searchBy = 1;
      if(Keyword.substr(0, 2) === 'NK') {
        searchBy = 2;
      }
      else if(Number.isInteger(parseInt(Keyword))) {
        searchBy = 3;
      }

      switch(searchBy) {
        case 2:
          sql += ` AND "a"."CustomerId" IN (SELECT "CustomerId" FROM "public"."customer" WHERE "CustomerCode" LIKE '%${Keyword}%')`;
          break;

        case 3:
          sql += ` AND "a"."CustomerId" IN (SELECT "CustomerId" FROM "public"."customerphonenumber" WHERE "PhoneNumber" LIKE '%${Keyword}%')`;
          break;

        default:
          sql += ` AND "a"."CustomerId" IN (SELECT "CustomerId" FROM "public"."customer" WHERE "FullName" LIKE '%${Keyword}%')`;
          break;
      }
    }

    sql += ` ORDER BY "a"."StartAt" ASC`;
    const execute = await sails.sendNativeQuery(sql);
    const appointments = execute.rows || [];
    return appointments;
  },

  _getAppointmentActions : (AppointmentStatusId = null, appointmentStatus = []) => {
    if(!AppointmentStatusId) return [];
    if(appointmentStatus.length === 0) return [];

    // Buttons 
    let buttons = [];
    if(AppointmentStatusId === 1) {
        buttons = [];
    }
    else if(AppointmentStatusId < 21) {
        buttons = appointmentStatus.filter(v => {
            if((v.AppointmentStatusId < 30 && v.AppointmentStatusId > 20) || v.AppointmentStatusId === 1) return v;
        });   
    }
    else if(AppointmentStatusId < 30) {                  
        buttons = appointmentStatus.filter(v => {
            if(v.AppointmentStatusId > 30 && v.AppointmentStatusId < 40) return v;
        });
    }
    else if(AppointmentStatusId < 50) {
        buttons = appointmentStatus.filter(v => {
            if(v.AppointmentStatusId > 50 && v.AppointmentStatusId < 60) return v;
        });
    }
    else if(AppointmentStatusId < 60) {
        buttons = appointmentStatus.filter(v => {
            if(v.AppointmentStatusId > 60 && v.AppointmentStatusId < 70) return v;
        });
    }
    else if(AppointmentStatusId < 70) {
        buttons = appointmentStatus.filter(v => {
            if(v.AppointmentStatusId > 70 && v.AppointmentStatusId < 80) return v;
        });
    }

    return buttons;
  },

  getAppointmentsInDay: async function (req, res) {
    const appointments = await AppointmentModel._getAppointments(req);
    if(appointments.length === 0) return {};

    const nowDate = new Date();
    console.log('getHours -> ', nowDate.getHours());
    console.log('------------');
    
    // Ids
    const customerIds = [];
    let appointmentStatusIds = [];
    let doctorIds = [];
    let branchIds = [];
    let staffIds = [];

    // Lịch hẹn theo khung giờ
    let hourAppointments = [];

    // Mapping
    appointments.map( appointment => { 
      const { 
        StartAt,
        AtBranchId = null,
        CustomerId,
        AppointedTo = null,
        AppointmentStatusId,
        EditedBy = null
      } = appointment;
    
      // Ids
      if(AtBranchId && AtBranchId > 0) branchIds.push(AtBranchId);
      if(AppointedTo && AppointedTo > 0) doctorIds.push(AppointedTo);
      if(EditedBy && EditedBy > 0) staffIds.push(EditedBy);
      customerIds.push(CustomerId);    
      appointmentStatusIds.push(AppointmentStatusId);

      // console.log('StartAt -> ', StartAt);
      const startAtDate = new Date(StartAt * 1000);
      // console.log('startAtDate -> ', startAtDate);
      const startAtHour = startAtDate.getHours();
      // console.log('startAtHour -> ', startAtHour);
      const startHour = startAtDate.getHours();
      // console.log('startHour -> ', startAtHour);
      const endHour = startAtHour + 1;
      // console.log('endHour -> ', endHour);
      // console.log('---------');

      if(startHour) hourAppointments[startHour] = {
        StartAtTime: `${startHour}:00`,
        EndAtTime: `${endHour}:00`,
        StartAtIndex: startHour,
        EndAtIndex: endHour
      };
    });
    // console.log('hourAppointments -> ', hourAppointments);
  
    // Danh sách bác sỹ
    doctorIds = [...new Set(doctorIds) ];
    const doctors = await AppointmentModel.getDoctorsByIds(doctorIds);
    
    // Danh sách chi nhánh
    branchIds = [...new Set(branchIds) ];
    const branchs = await AppointmentModel.getBranchsByIds(branchIds);

    // Danh sách nhân viên
    staffIds = [...new Set(staffIds) ];
    const staffs = await WidgetModel.getStaffsByIds(staffIds);

    // Trạng thái lịch hẹn
    appointmentStatusIds = [...new Set(appointmentStatusIds) ];
    const appointmentStatus = await WidgetModel.getAppointmentStatus();

    // Số điện thoại khách hàng
    const customers = await AppointmentModel.getCustomerByIds(customerIds);
    const customerPhoneNumbers = await CustomerModel.getPhonesByCustomerIds(customerIds);

    // Loại lịch hẹn: Tư vấn, điều trị, tái khám
    const appointmentTypes = await WidgetModel.getAppointmentTypes();
    
    // Số lượng lịch hẹn theo: checkin, checkout, cancel, total
    let appointmentTotalStatistics = {};
    
    // Lịch hẹn theo khung giờ
    // Sáng  : 7 -> 12
    // Tối   : 13 -> 21
    let appointmentModeDark = [];
    let appointmentModeLight = [];
    
    // hourAppointments = hourAppointments.filter(v => v);
    hourAppointments.map(v => {
      const { 
        StartAtIndex, 
        EndAtIndex,
        StartAtTime,
        EndAtTime
      } = v;
      let total = 0;
      let data = [];

      // Thống kê số lượng lịch hẹn trong ngày: Tổng, Checkin, Not Checkin, Cancel
      let appointmentTotal = 0;
      let appointmentCheckin = 0;
      let appointmentNotCheckin = 0;
      let appointmentCancel = 0;

      appointments.map( appointment => {
          const { 
            CustomerId, 
            AppointmentStatusId,
            AppointedTo,
            StartAt,
            EndAt,
            AtBranchId,
            EditedBy, 
            AppointmentLabelId
          } = appointment;

          // Khách hàng, sđt khách hàng
          let customer = customers.find(customer => customer.CustomerId == CustomerId);
          appointment.Customer = customer;

          // Số điện thoại
          const phoneNumbers = customerPhoneNumbers.filter(customer => customer.CustomerId == CustomerId) || null;
          const PhoneNumber = [];
          if(phoneNumbers && phoneNumbers.length !== 0) {
              phoneNumbers.map(v => PhoneNumber.push(v.PhoneNumber));
          }
          if(PhoneNumber && PhoneNumber.length !== 0) appointment.Customer.PhoneNumber = [...new Set(PhoneNumber)];
          
          // Loại lịch hẹn
          appointment.AppointmentType = appointmentTypes.find(v => v.AppointmentLabelId == AppointmentLabelId) || {};
      
          // Trạng thái lịch hẹn
          appointment.AppointmentStatus = appointmentStatus.find(aps => aps.AppointmentStatusId == AppointmentStatusId);

          // Chi nhánh khám
          appointment.Branch = branchs.find(b => b.BranchId == AtBranchId);

          // Bác sỹ điểu trị
          const doctor = doctors.find(d => d.DoctorId == AppointedTo) || null;
          appointment.Doctor = doctor;

          // Cập nhật lịch hẹn bởi ai
          let staff = staffs.find(s => s.StaffId == EditedBy);
          if(EditedBy) appointment.Edited = staff;

          // Thời gian đặt lịch hẹn
          const startAtDate = new Date(StartAt * 1000);
          const startAtHour = startAtDate.getHours();
          const startAtMinute = checkTime(startAtDate.getMinutes());
          const startAtYear = startAtDate.getFullYear();
          const startAtMonth = checkTime(startAtDate.getMonth() + 1);
          const startAtDay   = checkTime(startAtDate.getDate());
          const endAtDate = new Date(EndAt * 1000);
          const endAtHour = endAtDate.getHours();
          const endAtMinute = checkTime(endAtDate.getMinutes());
          const endAtYear = endAtDate.getFullYear();
          const endtAtMonth = checkTime(endAtDate.getMonth() + 1);
          const endAtDay   = checkTime(endAtDate.getDate());
          appointment.StartAtTime = `${startAtHour}:${startAtMinute}`;
          appointment.EndAtTime   = `${endAtHour}:${endAtMinute}`;
          appointment.StartAtFulltime = `${startAtYear}-${startAtMonth}-${startAtDay}`;
          appointment.EndAtFulltime = `${endAtYear}-${endtAtMonth}-${endAtDay}`;

          // Thao tác xử lý cho lịch hẹn
          appointment.Buttons = AppointmentModel._getAppointmentActions(AppointmentStatusId, appointmentStatus);

          // Nhóm lịch hẹn theo từng khung giờ
          if(startAtHour === StartAtIndex && startAtHour < EndAtIndex) {      
              total++;
              data.push(appointment);
          }

          // Total appointment
          if(AppointmentStatusId == 1) appointmentCancel++;
          else if(AppointmentStatusId == 11) appointmentNotCheckin++;
          else if(AppointmentStatusId >= 21) appointmentCheckin++;
          appointmentTotal++;
          appointmentTotalStatistics = {
            Cancel: appointmentCancel,
            Checkin: appointmentCheckin,
            NotCheckin: appointmentNotCheckin,
            Total: appointmentTotal
          }

          return appointment;
      });

      // Lịch hẹn theo khung giờ: sáng -> tối
      if(StartAtIndex >= 7 && StartAtIndex < 13) {       
        appointmentModeLight.push({
          StartAtIndex, 
          EndAtIndex,
          StartAtTime,
          EndAtTime,
          Total: total
        });
      }
      else if(StartAtIndex >= 13) {
        appointmentModeDark.push({
          StartAtIndex, 
          EndAtIndex,
          StartAtTime,
          EndAtTime,
          Total: total
        });
      }

      v.Data = data;
      v.Total = total;
      return v;
    });
   
    const Appointment = {
      AppointmentStatistic: appointmentTotalStatistics,
      AppointmentModeLights: appointmentModeLight,
      AppointmentModeDarks: appointmentModeDark,
      Appointments: hourAppointments,
      Doctors: doctors,
      Branchs: branchs
    };

    return Appointment;
  },

  getAppointment: async (AppointmentId = null) => {
    if(!AppointmentId) return {};

    // Thông tin lịch hẹn
    try {
      const appointment = await AppointmentModel.findOne({
        where: { id: AppointmentId }
      });
      return appointment;
    }
    catch(e) {
      return e;
    }
  },

  getCustomerByIds: async customerIds => {
    if(customerIds.length === 0) return [];
    const whereIn = customerIds.join();
    const sql = `SELECT 
                  "CustomerId",
                  "FullName", 
                  "Gender", 
                  "Birthday",
                  "Address",
                  "Photo",
                  "CustomerCode",
                  "PercentProfile"
                FROM "public"."customer"
                WHERE "CustomerId" IN (${whereIn})`;

    const executeCustomers = await sails.sendNativeQuery(sql);
    const customers = executeCustomers.rows || [];
    customers.length !== 0 && customers.map(customer => {
      const { 
        CustomerId,
        Gender,
        Photo
      } = customer;
      customer.Photo = CustomerModel.getPhotoUrl({
        CustomerId,
        Gender,
        Photo
      });
      return customer;
    });
    return customers;
  },

  getAppointmentTypesByIds: async appointmentIds => {
    if(appointmentIds.length === 0) return [];
    const whereIn = appointmentIds.join();
    const sql = `SELECT 
                  "AppointmentLabelId",
                  "AppointmentId"
                FROM "public"."appointmentappointmentlabel"
                WHERE "AppointmentId" IN (${whereIn})`;

    const execute = await sails.sendNativeQuery(sql);
    const result = execute.rows || [];
    return result;
  },

  getBranchsByIds: async branchIds => {
    if(branchIds.length === 0) return [];
    const whereIn = branchIds.join();
    const sql = `SELECT 
                  "BranchId",
                  "BranchCode",
                  "Name"
                FROM "public"."branch" 
                WHERE "BranchId" IN (${whereIn})
                ORDER BY "Name" ASC`;
    const execute = await sails.sendNativeQuery(sql);
    const result = execute.rows || [];
    return result;
  },

  getDoctorsByIds: async doctorIds => {
    if(doctorIds.length === 0) return [];
    const whereIn = doctorIds.join();
    const sql = `SELECT 
                  "d"."DoctorId",
                  "s"."StaffId",
                  "s"."FullName",
                  "s"."Photo",
                  "s"."GenderId" as "Gender"
                FROM "public"."doctor" as "d"
                LEFT JOIN "public"."staff" as "s" ON "s"."StaffId" = "d"."StaffId" 
                WHERE "d"."DoctorId" IN (${whereIn})`;
    const executeDoctor = await sails.sendNativeQuery(sql);
    const doctors = executeDoctor.rows || [];
    doctors.length !== 0 && doctors.map(doctor => {
      const { StaffId, Photo, Gender } = doctor;
      doctor.Photo = WidgetModel.getStaffPhotoUrl({
        StaffId,
        Photo,
        Gender
      });
      return doctor;
    });
    return doctors;
  },

  _update: async (AppointmentId, AppointmentData) => {
    AppointmentData.EditedAt = ~~(new Date().getTime()/1000);
    const appointment = await AppointmentModel.update({ id: AppointmentId }).set(AppointmentData).fetch();

    if(appointment.length !== 0) {
      const [Appointment] = appointment;
      Appointment.AppointmentId = Appointment.id;
      delete Appointment.id;

      return {
        Appointment,
        Notify: [{
          Message: 'Cập nhật lịch hẹn thành công!',
          Code: true
        }]
      };
    }

    return {
      Appointment: null,
      Notify: [{
        Message: 'Cập nhật lịch hẹn thất bại!',
        Code: false
      }]
    };
  },

  _create: async (AppointmentData) => {
    const checkSaveInDay = await AppointmentModel._checkSaveInDay(AppointmentData);
    if(!checkSaveInDay) {
        return {
          Appointment: null,
          Notify: [{
            Message: 'Khách hàng đã có lịch hẹn trong ngày!',
            Code: false
          }]
        };
    }

    AppointmentData.CreatedAt = ~~(new Date().getTime()/1000);
    AppointmentData.AppointmentStatusId = 11;
    const Appointment = await AppointmentModel.create(AppointmentData).fetch();

    if(!Appointment && Object.values(Appointment).length === 0) {
      return {
        Appointment: null,
        Notify: [{
          Message: 'Thêm mới lịch hẹn thất bại!',
          Code: false
        }]
      }
    }

    Appointment.AppointmentId = Appointment.id;
    delete Appointment.id;
    return {
      Appointment,
      Notify: [{
        Message: 'Thêm mới lịch hẹn thành công!',
        Code: true
      }]
    }
  },

  _checkSaveInDay: async (AppointmentData = null) => {
    if(!AppointmentData) return false;

    const { 
      CustomerId, 
      StartAt 
    } = AppointmentData;
    const startAtDate = new Date(StartAt);
    const startAtYear = startAtDate.getFullYear();
    const startAtMonth = checkTime(startAtDate.getMonth() + 1);
    const startAtDay = checkTime(startAtDate.getDate());
    const startAt = `${startAtYear}-${startAtMonth}-${startAtDay}`;

    const sql = `SELECT AppointmentId
                 FROM appointment
                 WHERE CustomerId = ${CustomerId}
                 AND AppointmentStatusId NOT IN (1,71)
                 AND DATE_FORMAT(FROM_UNIXTIME(StartAt), \'%Y-%m-%d\') = '${startAt}'`;    
    const execute = await sails.sendNativeQuery(sql);
    const ids = execute.rows || [];
    if(ids.length !== 0) return false;
    
    return true;
  },

  save: async (req) => {
    const { 
      AppointmentId = null 
    } = req.params;

    const AppointmentData = req.allParams();
    if(Object.values(AppointmentData).length === 0) return {
      Appointment: null,
      Notify: [{
        Message: 'Cập nhật lịch hẹn thất bại!',
        Code: false
      }]
    };

    const {
      StartAt, 
      EndAt 
    } = AppointmentData;
    AppointmentData.StartAt = ~~(new Date(StartAt).getTime()/1000);
    AppointmentData.EndAt = ~~(new Date(EndAt).getTime()/1000);

    // Cập nhật
    if(AppointmentId && AppointmentId > 0) return await AppointmentModel._update(AppointmentId, AppointmentData);
    else return await AppointmentModel._create(AppointmentData);
  },

  changeAppointmentStatus: async (req) => {
    let response = {
      Appointment: null,
      Notify: [{
        Message: 'Cập nhật trạng thái lịch hẹn thất bại!',
        Code: false
      }]
    };

    const { 
      AppointmentId = null 
    } = req.params;
    const Appointment = req.allParams();
    if(Object.values(Appointment).length === 0 || !AppointmentId) {
      return {
        Appointment: null,
        Notify: [{
          Message: 'Cập nhật trạng thái lịch hẹn thất bại!',
          Code: false
        }]
      };
    }

    // Thông tin lịch hẹn
    const appointment = await AppointmentModel.findOne({
      where: { id: AppointmentId },
      select: ['StartAt', 'EndAt']
    });
    const { 
      StartAt
    } = appointment;

    const { 
      AppointmentStatusId 
    } = Appointment;
    Appointment.EditedAt = ~~(new Date().getTime()/1000);

    const date = new Date();
    const year = date.getFullYear();
    const month = checkTime(date.getMonth() + 1);
    const day = checkTime(date.getDate());
    const fromDate = new Date(`${year}-${month}-${day} 00:00:00`);
    const fromDateTimestamp = ~~((fromDate.getTime())/1000);
    const toDate   = new Date(`${year}-${month}-${day} 23:59:59`);
    const toDateTimestamp = ~~((toDate.getTime())/1000);

    if((StartAt < fromDateTimestamp || StartAt > toDateTimestamp && AppointmentStatusId > 1)) {
      return {
        Appointment: null,
        Notify: [{
          Message: 'Không thể cập nhật do lịch hẹn không ở ngày hiện tại!',
          Code: false
        }]
      }
    };

    const appointmentStatus = await AppointmentModel.update({ id: AppointmentId }).set(Appointment).fetch();
    if(appointmentStatus.length !== 0) {
      return {
        Appointment: appointment,
        Notify: [{
          Message: 'Cập nhật lịch hẹn thành công!',
          Code: true
        }]
      } 
    }
    
    return {
      Appointment: appointment,
      Notify: [{
        Message: 'Cập nhật lịch hẹn thất bại!',
        Code: false
      }]
    }
  }
};
