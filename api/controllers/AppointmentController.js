/**
 * AppointmentController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const fs = require('fs');
const checkTime = time => time < 10 ? `0${time}` : `${time}`;

// Base path
const appPath = sails.config.appPath;

module.exports = {
    getAppointmentsInDay: async function(req, res) {
        const appointments =  await AppointmentModel.getAppointmentsInDay(req, res);
        return res.json(appointments);
    },

    save: async (req, res) => {
        const appointment = await AppointmentModel.save(req);    
        return res.json(appointment);
    },

    changeAppointmentStatus: async (req, res) => {
        const statusChange = await AppointmentModel.changeAppointmentStatus(req);
        return res.json(statusChange);
    },

    getAppointment: async (req, res) => {
        const { 
            AppointmentId = null 
        } = req.params;
        const appointment = await AppointmentModel.getAppointment(AppointmentId);
        return res.json(appointment);
    }
};

