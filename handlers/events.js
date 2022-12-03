const { firebase } = require('../util/firebase')
const { db } = require("../util/admin");

exports.events = async (req, res) => {

    const eventsRef = db.collection('events');
     try{
        eventsRef.get().then((snapshot) => {
            const data = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            console.log(data); 
           return res.status(201).json(data);
          })
    } catch (error) {
        return res
            .status(500)
            .json({ general: "Something went wrong, please try again" });
    }
};