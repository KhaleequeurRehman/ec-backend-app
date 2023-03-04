const { Ingridient, validate } = require("../models/ingridient")

exports.addIngridient = async (req, res) => {
    try {
        const { error } = validate(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        let ingridient = await Ingridient.findOne({ title: req.body.title });
        if (ingridient) return res.status(400).send('Ingridient already added.');

        const resData = new Ingridient(req.body)

        await resData.save()

        return res.status(200).json({ status: true, message: "New ingridient created successfully" });
    } catch (err) {
        return res.status(500).json({ status: false, message: err.message });
    }
}

exports.editIngridient = async (req, res) => {
    try {
        const { error } = validate(req.body);
        
        if (error) return res.status(400).send(error.details[0].message);

        const ingridient = await Ingridient.findByIdAndUpdate(req.params.id, { ...req.body }, {
            new: true
        });

        if (!ingridient) return res.status(404).send('The ingridient with the given ID was not found.');

        res.send(genre);
    } catch (err) {
        return res.status(500).json({ status: false, message: err.message });
    }
}

exports.deleteIngridient = async (req, res) => {
    try {
        const ingridient = await Ingridient.findByIdAndRemove(req.params.id);

        if (!ingridient) return res.status(404).send('The ingridient with the given ID was not found.');

        res.send(ingridient);
    } catch (err) {
        return res.status(500).json({ status: false, message: err.message });
    }
}