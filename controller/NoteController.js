const { Note, validate } = require("../models/notes.js")

exports.makeNote = async (req, res) => {
    try {

        if (req.user.type !== "admin"){
            return res.status(401).json({ status: false, message:"Only Admin can Add New Note"});
        }

        const { error } = validate({ ...req.body});
        if (error) return res.status(400).send(error.details[0].message);

        console.log("req.body of note", req.body)
        const resData = new Note({
            description: req.body.description,
            userId: req.body.userId
        })

        await resData.save()

        console.log(resData)
        return res.status(201).json({ status: true, message: "New Note Created Successfully" });
    } catch (err) {
        return res.status(500).json({ status: false, message: err.message });
    }
}

exports.getAllNotes = async (req, res) => {
    try {

        if (req.user.type !== "admin"){
            return res.status(401).json({ status: false, message:"Only Admin Can Get"});
        }

        let page = parseInt(req.query.page);
        let limit = parseInt(req.query.size);
        const sortBy = req.query.sortBy
        const orderBy = req.query.orderBy

        const notesRes = await Note.find({}).skip((page - 1) * limit)
            .limit(limit).sort(`${orderBy === "desc" ? "-" : ""}${sortBy}`)
        return res.status(200).json({ status: true, message:"All Notes",data:notesRes})
    } catch (err) {
        return res.status(500).json({ status: false, message: err.message });
    }
}

exports.getNotesByUserId = async (req, res) => {
    try {

        if (req.user.type !== "admin"){
            return res.status(401).json({ status: false, message:"Only Admin Can Get"});
        }

        let page = parseInt(req.query.page);
        let limit = parseInt(req.query.size);
        const sortBy = req.query.sortBy
        const orderBy = req.query.orderBy

        if(!req.query.id){
            return res.status(400).json({ status: false, message:"id is missing"});
        }

        const notesRes = await Note.find({userId:req.query.id}).skip((page - 1) * limit)
            .limit(limit).sort(`${orderBy === "desc" ? "-" : ""}${sortBy}`)
        return res.status(200).json({ status: true, message:"All Notes",data:notesRes})
    } catch (err) {
        return res.status(500).json({ status: false, message: err.message });
    }
}



exports.updateNote = async (req, res) => {
    try {

        console.log("req.body ",req.body);

        if (req.user.type !== "admin"){
            return res.status(401).json({ status: false, message:"Only Admin Can Update"});
        }

        if(!req.body.id){
            return res.status(404).json({ status: false, message:"id is missing"});
        }
        
        const note = await Note.findOne({_id:req.body.id})

        if(!note){
            return res.status(400).json({ status: false, message:"Invalid Id"});
        }

        // const notesRes = await Note.findByIdAndUpdate({_id:req.body.id},req.body.description)
        const notesRes = await Note.findOneAndUpdate({_id:req.body.id}, {description:req.body.description})
        return res.status(200).json({ status: true, message: "Note Updated Successfully" })
    } catch (err) {
        return res.status(500).json({ status: false, message: err.message });
    }
}

exports.delteNote = async (req, res) => {
    try {

        console.log("req.body ",req.body);

        if (req.user.type !== "admin"){
            return res.status(401).json({ status: false, message:"Only Admin Can Delete"});
        }

        if(!req.body.id){
            return res.status(404).json({ status: false, message:"id is missing"});
        }
        
        const note = await Note.findOne({_id:req.body.id})

        if(!note){
            return res.status(400).json({ status: false, message:"Invalid Id"});
        }

        const notesRes = await Note.findOneAndDelete({_id:req.body.id}).exec();
        return res.status(200).json({ status: true, message: "Note Deleted Successfully" })
    } catch (err) {
        return res.status(500).json({ status: false, message: err.message });
    }
}


exports.deleteNote = async (req, res) => {
    try {

        if (req.user.type !== "admin"){
            return res.status(401).json({ status: false, message:"Only Admin Can Delete"});
        }

        if(!req.body.id){
            return res.status(404).json({ status: false, message:"id is missing"});
        }
        
        const note = await Note.findById({_id:req.body.id})

        if(!note){
            return res.status(400).json({ status: false, message:"Invalid Id"});
        }

        const notesRes = await Note.findByIdAndDelete({_id:req.body.id})
        return res.status(200).json({ status: true, message: "Note Deleted Successfully" })
    } catch (err) {
        return res.status(500).json({ status: false, message: err.message });
    }
}