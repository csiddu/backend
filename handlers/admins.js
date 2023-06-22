const express = require("express");
const router = express.Router();
const { db, storage ,getDownloadURL  } = require("../util/admin");
const { firebase } = require("../util/firebase");
const getRawBody = require('raw-body')


router.get("/login", (req, res) => {
  res.json({
    status: "success",
  });
});

router.post("/login", (req, res) => {
  const email = "admin123@gmail.com";
  const password = "123";
  var response = {};

  console.log(req.body);

  if (req.body.email === email && req.body.password === password) {
    response["email"] = email;
    response["isLoggedIn"] = true;
    console.log("success");
  } else {
    response["error"] = "Data is not valid";
    response["isLoggedIn"] = false;
  }
  res.status(201).json(response);
});

router.post("/addTeam", async (req, res) => {
  var ref = db.collection("AllTeams");

  
    const req1 = ref.add(req.body).then((i) => {console.log(i.id);res.json({ id: i.id })});
  

  // res.json("okay");
});

router.post("/addFaculty", async (req, res) => {
  var ref = db.collection("Faculties");

  if (!req.files) {
    res.status(400).send("Error: Profile Photo not found");
  }

  // ref.get().then((snapshot) => {
  //   const data = snapshot.docs.map((doc) => {
  //     if (doc.email == req.body.email) {
  //       res.json({ error: "email already exist" });
  //     }
  //   });
  // });

  const blob = storage
    .bucket("website-backend-a17fd.appspot.com")
    .file("teams/TeamPhotos/Faculty/" + req.body.obj.email);

  const blobWriter = blob.createWriteStream({
    metadata: {
      contentType: req.files[0].mimetype,
    },
  });

  blobWriter.on("error", (err) => {
    console.log(err);
  });

  blobWriter.end(req.files[0].buffer);

  const req1 = await ref.add(req.body.obj);

  res.json("okay");
});

router.post("/addMember", async (req, res) => {
  var ref = db.collection("AllTeams");

  if (!req.files) {
    res.status(400).send("Error: Profile Photo not found");
  }

  const blob = storage
    .bucket("website-backend-a17fd.appspot.com")
    .file(
      "teams/TeamPhotos/TeamMembers/" +
        new Date().getFullYear() +
        "/" +
        req.body.obj.email
    );

  const blobWriter = blob.createWriteStream({
    metadata: {
      contentType: req.files[0].mimetype,
    },
  });

  blobWriter.on("error", (err) => {
    console.log(err);
  });

  blobWriter.end(req.files[0].buffer);

  var team = [];

  ref.get().then((snapshot) => {
    const data = snapshot.docs.forEach((doc) => {
      if (doc.id === req.body.teamID) {
        team = {
          id: doc.id,
          ...doc.data(),
        };
        team.teamMembers.push(req.body.obj);
        ref
          .doc(req.body.teamID)
          .update({
            teamMembers: team.teamMembers,
          })
          .then();
        res.json("okay");
      }
    });
  });
});

router.get("/getAllFaculty", async (req, res) => {
  var ref = db.collection("Faculties");
  ref.get().then((snapshot) => {
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    console.log(data);
    return res.status(201).json(data);
  });
});

router.get("/getTeamMember", async (req, res) => {
  var ref = db.collection("AllTeams");
  var team = [];
  // console.log(req.query.id)
  ref.get().then((snapshot) => {
    const data = snapshot.docs.forEach((doc) => {
      if (doc.data().year === new Date().getFullYear()) {
        team = {
          id: doc.id,
          ...doc.data(),
        };
      }
    });
    res.json({ obj: team });
  });
});

router.get("/teamByYear", async (req, res) => {

  // fetch should be like : /teamByYear?year={year}

  var ref = db.collection("AllTeams");

  

  var year = req.query.year;

  ref.get().then((snapshot) => {
    snapshot.docs.forEach((doc) => {
      var team = {};
      if(doc.data().year == year){
        team = {
          id: doc.id,
          ...doc.data(),
        };
      }

      if(Object.hasOwn(team, "teamMembers")){
        team.teamMembers.forEach(async (obj)=>{
          
          const file = storage.bucket("website-backend-a17fd.appspot.com").file('teams/TeamPhotos/TeamMembers/'+year+'/' +obj.email).getMetadata().then((m)=>
          {
          console.log(m)

          })
          
          
        })
        
      }
      
      if (!Object.hasOwn(team, "teamMembers")) {
        team.teamMembers = [];
      }
    res.json({ team: team });

    });
  });
});

router.get("/allTeamInfo", async (req, res) => {
  var ref = db.collection("AllTeams");
  var teams = [];
  ref.get().then((snapshot) => {
    snapshot.docs.forEach((doc) => {
      var team = {
        id: doc.id,
        ...doc.data(),
      };
      if (!Object.hasOwn(team, "teamMembers")) {
        team.teamMembers = [];
      }
      teams.push(team);
    });
    res.json({ teams: teams });
  });
});

router.post("/addEvent", async (req, res) => {
  var ref = db.collection("Events");
  if (!req.files) {
    res.status(400).send("Error: Event Photo not found");
  }
  const blob = storage
    .bucket("website-backend-a17fd.appspot.com")
    .file("events/" + req.body.obj.title);

  const blobWriter = blob.createWriteStream({
    metadata: {
      contentType: req.files[0].mimetype,
    },
  });

  blobWriter.on("error", (err) => {
    console.log(err);
  });

  blobWriter.end(req.files[0].buffer);

  const req1 = await ref.add(req.body.obj);

  res.json("okay");
});

router.get("/isTeamExist", async (req, res) => {
  var ref = db.collection("AllTeams");
  var bool = 0;
  ref.get().then((snapshot) => {
    snapshot.docs.forEach((doc) => {
      if (doc.data().year === new Date().getFullYear()) {
        bool = 1;
      }
    });
    res.json({ flg: bool });
  });
});

router.post("/deleteTeamMember", async (req, res) => {
  var ref = db.collection("AllTeams");
  ref.get().then((snapshot) => {
    const data = snapshot.docs.forEach((doc) => {
      console.log(req.body.id, doc.id);
      if (doc.id === req.body.id) {
        team = {
          id: doc.id,
          ...doc.data(),
        };
        console.log("high");
        team.teamMembers.splice(req.body.index, 1);
        console.log(team.teamMembers);
        ref
          .doc(req.body.id)
          .update({
            teamMembers: team.teamMembers,
          })
          .then();
        res.json("okay");
      }
    });
  });
});

module.exports = { admins: router };
