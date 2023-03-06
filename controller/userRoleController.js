const { UserRoles, validate } = require("../models/userRoles")

exports.getAllUserRole = async (req, res) => {
    try {
        let page = parseInt(req.query.page);
        let size = parseInt(req.query.size);
        const sortBy = req.query.sortBy
        const orderBy = req.query.orderBy
        const searchBy = req.query.searchBy || ""
        const data = await UserRoles.find({ title: { $regex: '^' + searchBy, $options: 'i' } })
        .skip((page - 1) * size).limit(size)
        .sort(`${orderBy === "desc" ? "-" : ""}${sortBy}`)
        .lean()
        .exec();
        let totalUserRoleCount = await UserRoles.countDocuments({}).exec();
        return res.status(200).json({ status: true, message: "Roles with respect to title", data,totalUserRoleCount });
    } catch (err) {
        return res.status(500).json({ status: false, message: err.message });
    }

    // try {
    // let page = parseInt(req.query.page);
    //     let size = parseInt(req.query.size);
    //     const sortBy = req.query.sortBy
    //     const orderBy = req.query.orderBy
    //     const searchBy = req.query.searchBy || ""
    //     const totalRoles = UserRoles.countDocuments({ title: { $regex: '^' + searchBy, $options: 'i' } })
    //     const data = await UserRoles.find({ title: { $regex: '^' + searchBy, $options: 'i' } })
    //     .skip((page - 1) * size).limit(size)
    //     .sort(`${orderBy === "desc" ? "-" : ""}${sortBy}`)
    //     .lean()
    //     .exec();
    //     return res.status(200).json({ status: true, message: "Roles with respect to title", data,totalRoles });
    // } catch (err) {
    //     return res.status(500).json({ status: false, message: err.message });
    // }
}

exports.addUserRole = async (req, res) => {
    try {
        const { error } = validate(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        let userRole = await UserRoles.findOne({ title: req.body.title });
        if (userRole) return res.status(400).send('user role already added.');

        const resData = new UserRoles(req.body)

        await resData.save()

        return res.status(200).json({ status: true, message: "New role created successfully" });
    } catch (err) {
        return res.status(500).json({ status: false, message: err.message });
    }
}

exports.editUserRole = async (req, res) => {
    try {
        // const { error } = validate(req.body);

        // if (error) return res.status(400).send(error.details[0].message);

        if (!req.body.title || !req.body.modules) {
            return res.status(404).json({status:false,message:"title or modules is missing"});
        }
        // const userRole = await UserRoles.findByIdAndUpdate(req.params.id, { ...req.body }, {
        const userRole = await UserRoles.findByIdAndUpdate(req.params.id, { title: req.body.title,modules: req.body.modules }, {
            new: true
        });

        if (!userRole) return res.status(404).json({status:false,message:"The user role with the given ID was not found."});
        res.status(200).json({status:true,message:"Updated Successfully",data:userRole});
        // res.send(userRole);
    } catch (err) {
        return res.status(500).json({ status: false, message: err.message });
    }
}

exports.deleteUserRoles = async (req, res) => {
    try {
        const userRole = await UserRoles.findByIdAndRemove(req.params.id);

        if (!userRole) return res.status(404).send('The role with the given ID was not found.');

        res.send(userRole);
    } catch (err) {
        return res.status(500).json({ status: false, message: err.message });
    }
}