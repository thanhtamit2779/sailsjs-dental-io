/**
 * AppointmentModel.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */
const checkTime = time => time < 9 ? `0${time}` : `${time}`;

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
      FromDay = null,
      ToDay = null,
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

    let fromDay = `${year}-${month}-${day} 00:00:00`
    let toDay = `${year}-${month}-${day} 23:59:59`;
    if (FromDay && FromDay !== '') fromDay = `${FromDay} 00:00:00`;
    if (ToDay && ToDay !== '') toDay = `${ToDay} 00:00:00`;

    let sql = `SELECT "AppointmentId", 
                      to_char("StartAt", 'DD-MM-YYYY') as "StartAtDay",
                      to_char("StartAt", 'HH24:MI') as "StartAtTime", 
                      EXTRACT(HOUR FROM "StartAt") as "StartAtIndex",
                      to_char("EndAt", 'HH24:MI') as "EndAtTime",
                      "AppointmentStatusId", 
                      "AppointedTo", 
                      "CreatedBy", 
                      to_char("CreatedAt", 'YYYY-MM-DD HH24:MI:SS') as "CreatedAt", 
                      "EditedBy", 
                      to_char("EditedAt", 'YYYY-MM-DD HH24:MI:SS') as "EditedAt", 
                      "AtBranchId", 
                      "AppointmentStatusNote", 
                      "Note", 
                      "CustomerId", 
                      "AppointmentLabelId"         
                FROM "public"."appointment"
                WHERE "StartAt" > '${fromDay}' AND "StartAt" < '${toDay}'`;
    if (BranchId > 0) {
      sql += ` AND "AtBranchId" = ${BranchId}`;
    }

    if (DoctorId > 0) {
      sql += ` AND "AppointedTo" = ${DoctorId}`;
    }

    if (AppointmentLabelId > 0) {
      sql += ` AND "AppointmentLabelId" = ${AppointmentLabelId}`;
    }

    if (AppointmentStatusIds.length !== 0) {
      sql += ` AND "AppointmentStatusId" IN (${AppointmentStatusIds.join()})`;
    }

    if (Keyword.length > 2) {
      // Search By
      // 1. FullName
      // 2. CustomerCode
      // 3. PhoneNumber
      let searchBy = 1;
      if (Keyword.substr(0, 2) === 'NK') {
        searchBy = 2;
      }
      else if (Number.isInteger(parseInt(Keyword))) {
        searchBy = 3;
      }

      switch (searchBy) {
        case 2:
          sql += ` AND CustomerId" IN (SELECT "CustomerId" FROM "public"."customer" WHERE "CustomerCode" LIKE '%${Keyword}%')`;
          break;

        case 3:
          sql += ` AND CustomerId" IN (SELECT "CustomerId" FROM "public"."customerphonenumber" WHERE "PhoneNumber" LIKE '%${Keyword}%')`;
          break;

        default:
          sql += ` AND CustomerId" IN (SELECT "CustomerId" FROM "public"."customer" WHERE "FullName" LIKE '%${Keyword}%')`;
          break;
      }
    }

    sql += ` ORDER BY "AppointmentId" ASC`;
    const execute = await sails.sendNativeQuery(sql);
    const appointments = execute.rows || null;
    return appointments;
  },

  _getAppointmentActions: (AppointmentStatusId = null, appointmentStatus = []) => {
    if (!AppointmentStatusId) return [];
    if (appointmentStatus.length === 0) return [];

    // Buttons 
    let buttons = [];
    if (AppointmentStatusId === 1) {
      buttons = [];
    }
    else if (AppointmentStatusId < 21) {
      buttons = appointmentStatus.filter(v => {
        if ((v.AppointmentStatusId < 30 && v.AppointmentStatusId > 20) || v.AppointmentStatusId === 1) return v;
      });
    }
    else if (AppointmentStatusId < 30) {
      buttons = appointmentStatus.filter(v => {
        if (v.AppointmentStatusId > 30 && v.AppointmentStatusId < 40) return v;
      });
    }
    else if (AppointmentStatusId < 50) {
      buttons = appointmentStatus.filter(v => {
        if (v.AppointmentStatusId > 50 && v.AppointmentStatusId < 60) return v;
      });
    }
    else if (AppointmentStatusId < 60) {
      buttons = appointmentStatus.filter(v => {
        if (v.AppointmentStatusId > 60 && v.AppointmentStatusId < 70) return v;
      });
    }
    else if (AppointmentStatusId < 70) {
      buttons = appointmentStatus.filter(v => {
        if (v.AppointmentStatusId > 70 && v.AppointmentStatusId < 80) return v;
      });
    }

    return buttons;
  },

  getAppointments: async function (req) {
    const Appointments = await AppointmentModel._getAppointments(req);
    if (Appointments.length === 0) return null;

    // Ids
    const customerIds = [];
    let appointmentStatusIds = [];
    let doctorIds = [];
    let branchIds = [];
    let staffIds = [];

    // Thống kê số lượng lịch hẹn trong ngày: Tổng, Checkin, Not Checkin, Cancel
    let AppointmentStatistic = null;
    let appointmentTotal = 0;
    let appointmentCheckin = 0;
    let appointmentNotCheckin = 0;
    let appointmentCancel = 0;
    Appointments.map(appointment => {
      const {
        AppointmentStatusId = null,
        AtBranchId = null,
        CustomerId = null,
        AppointedTo = null,
        EditedBy = null
      } = appointment;
      if (AtBranchId && AtBranchId > 0) branchIds.push(AtBranchId);
      if (AppointedTo && AppointedTo > 0) doctorIds.push(AppointedTo);
      if (EditedBy && EditedBy > 0) staffIds.push(EditedBy);
      if (CustomerId) customerIds.push(CustomerId);

      if (AppointmentStatusId) appointmentStatusIds.push(AppointmentStatusId);
      if (AppointmentStatusId === 1) appointmentCancel++;
      else if (AppointmentStatusId === 11) appointmentNotCheckin++;
      else if (AppointmentStatusId >= 21) appointmentCheckin++;
      appointmentTotal++;
      AppointmentStatistic = {
        Cancel: appointmentCancel,
        Checkin: appointmentCheckin,
        NotCheckin: appointmentNotCheckin,
        Total: appointmentTotal
      }
    });

    doctorIds = [...new Set(doctorIds)];
    const doctors = await AppointmentModel.getDoctorsByIds(doctorIds);

    branchIds = [...new Set(branchIds)];
    const branchs = await AppointmentModel.getBranchsByIds(branchIds);

    staffIds = [...new Set(staffIds)];
    const staffs = await WidgetModel.getStaffsByIds(staffIds);

    appointmentStatusIds = [...new Set(appointmentStatusIds)];
    const appointmentStatus = await WidgetModel.getAppointmentStatus();

    const customers = await AppointmentModel.getCustomerByIds(customerIds);
    const customerPhoneNumbers = await CustomerModel.getPhonesByCustomerIds(customerIds);

    const appointmentTypes = await WidgetModel.getAppointmentTypes();

    Appointments.map(appointment => {
      const {
        CustomerId,
        AppointmentStatusId,
        AppointedTo,
        AtBranchId,
        EditedBy,
        AppointmentLabelId,
        StartAtIndex
      } = appointment;

      // Khách hàng, sđt khách hàng
      let customer = customers.find(customer => customer.CustomerId === CustomerId) || null;
      appointment.Customer = customer;

      // Số điện thoại
      const phoneNumbers = customerPhoneNumbers.filter(customer => customer.CustomerId === CustomerId) || null;
      const PhoneNumber = [];
      if (phoneNumbers && phoneNumbers.length !== 0) {
        phoneNumbers.map(v => PhoneNumber.push(v.PhoneNumber));
      }
      if (PhoneNumber && PhoneNumber.length !== 0) appointment.Customer.PhoneNumber = [...new Set(PhoneNumber)];

      appointment.AppointmentType = appointmentTypes.find(v => v.AppointmentLabelId === AppointmentLabelId) || null;
      appointment.AppointmentStatus = appointmentStatus.find(aps => aps.AppointmentStatusId === AppointmentStatusId) || null;
      appointment.Branch = branchs.find(b => b.BranchId === AtBranchId) || null;
      appointment.Doctor = doctors.find(d => d.DoctorId === AppointedTo) || null;
      appointment.Edited = staffs.find(s => s.StaffId === EditedBy) || null;
      appointment.Buttons = AppointmentModel._getAppointmentActions(AppointmentStatusId, appointmentStatus);

      return appointment;
    });

    return {
      AppointmentStatistic,
      Appointments,
      Doctors: doctors,
      Branchs: branchs
    };
  },

  getAppointment: async (AppointmentId = null) => {
    if (!AppointmentId) return {};

    // Thông tin lịch hẹn
    try {
      const appointment = await AppointmentModel.findOne({
        where: { id: AppointmentId }
      });
      return appointment;
    }
    catch (e) {
      return e;
    }
  },

  getCustomerByIds: async customerIds => {
    if (customerIds.length === 0) return [];
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
    if (appointmentIds.length === 0) return [];
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
    if (branchIds.length === 0) return [];
    const whereIn = branchIds.join();
    const sql = `SELECT 
                  "BranchId",
                  "BranchCode",
                  "Name",
                  "Address"
                FROM "public"."branch" 
                WHERE "BranchId" IN (${whereIn})
                ORDER BY "Name" ASC`;
    const execute = await sails.sendNativeQuery(sql);
    const result = execute.rows || [];
    return result;
  },

  getDoctorsByIds: async doctorIds => {
    if (doctorIds.length === 0) return [];
    const whereIn = doctorIds.join();
    const sql = `SELECT 
                  "d"."DoctorId",
                  "s"."StaffId",
                  "s"."FullName",
                  "s"."Photo",
                  "s"."Gender"
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
    AppointmentData.EditedAt = ~~(new Date().getTime() / 1000);
    const appointment = await AppointmentModel.update({ id: AppointmentId }).set(AppointmentData).fetch();

    if (appointment.length !== 0) {
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
    if (!checkSaveInDay) {
      return {
        Appointment: null,
        Notify: [{
          Message: 'Khách hàng đã có lịch hẹn trong ngày!',
          Code: false
        }]
      };
    }

    AppointmentData.AppointmentStatusId = 11;
    const Appointment = await AppointmentModel.create(AppointmentData).fetch();

    if (!Appointment && Object.values(Appointment).length === 0) {
      return {
        Appointment: null,
        Notify: [{
          Message: 'Thêm mới lịch hẹn thất bại!',
          Code: false
        }]
      }
    }

    Appointment.AppointmentId = Appointment.id;
    if (Appointment) delete Appointment.id;
    return {
      Appointment,
      Notify: [{
        Message: 'Thêm mới lịch hẹn thành công!',
        Code: true
      }]
    }
  },

  _checkSaveInDay: async (AppointmentData = null) => {
    if (!AppointmentData) return false;

    const {
      CustomerId,
      StartAt
    } = AppointmentData;
    const sql = `SELECT "AppointmentId"
                 FROM "public"."appointment"
                 WHERE "CustomerId" = ${CustomerId}
                 AND "AppointmentStatusId" NOT IN (1,71) AND to_char("StartAt", 'YYYY-MM-DD') = '${StartAt}'`;
    const execute = await sails.sendNativeQuery(sql);
    const appointment = execute.rows || null;
    if (appointment && appointment.length !== 0) return false;
    return true;
  },

  save: async (req) => {
    const {
      AppointmentId = null
    } = req.params;

    const AppointmentData = req.allParams();
    if (Object.values(AppointmentData).length === 0) return {
      Appointment: null,
      Notify: [{
        Message: 'Cập nhật lịch hẹn thất bại!',
        Code: false
      }]
    };

    // Cập nhật
    if (AppointmentId && AppointmentId > 0) return await AppointmentModel._update(AppointmentId, AppointmentData);
    else return await AppointmentModel._create(AppointmentData);
  },

  changeAppointmentStatus: async (req) => {
    const {
      AppointmentId = null
    } = req.params;
    const Appointment = req.allParams();
    if (Object.values(Appointment).length === 0 || !AppointmentId) {
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
    
    const date = new Date();
    const year = date.getFullYear();
    const month = checkTime(date.getMonth() + 1);
    const day = checkTime(date.getDate());
    const fromDate = new Date(`${year}-${month}-${day} 00:00:00`);
    const fromDateTimestamp = ~~((fromDate.getTime()) / 1000);
    const toDate = new Date(`${year}-${month}-${day} 23:59:59`);
    const toDateTimestamp = ~~((toDate.getTime()) / 1000);

    if ((StartAt < fromDateTimestamp || StartAt > toDateTimestamp && AppointmentStatusId > 1)) {
      return {
        Appointment: null,
        Notify: [{
          Message: 'Không thể cập nhật do lịch hẹn không ở ngày hiện tại!',
          Code: false
        }]
      }
    };

    const appointmentStatus = await AppointmentModel.update({ id: AppointmentId }).set(Appointment).fetch();
    if (appointmentStatus.length !== 0) {
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
