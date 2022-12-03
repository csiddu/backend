const { firebase } = require('../util/firebase')
const { db } = require("../util/admin");

exports.links = async (req, res) => {

    const linksRef = db.collection('links').doc('eventLinks');
    try {
        linksRef.get().then(
            (snapshot) => {
                const data = snapshot.data();
                console.log(data);
                return res.status(201).json(data);
            }
        );
    } catch (error) {
        return res
            .status(500)
            .json({ general: "Something went wrong, please try again" });
    }
};