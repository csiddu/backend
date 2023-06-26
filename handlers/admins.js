const express = require("express");
const router = express.Router();
const { db, storage } = require("../util/admin");
const { firebase } = require("../util/firebase");
require("firebase/storage");
const storage_ = firebase
  .app()
  .storage("gs://website-backend-a17fd.appspot.com");

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

  const req1 = ref.add(req.body).then((i) => {
    console.log(i.id);
    res.json({ id: i.id });
  });

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

  var refFaculty = db.collection("Faculties");

  var ref = db.collection("AllTeams");

  var year = req.query.year;

  ref.get().then((snapshot) => {

    // From AllTeams Search the team year wise
    snapshot.docs.forEach((doc) => {
      var team = {};
      if (doc.data().year == year) {

        team = {
          id: doc.id,
          ...doc.data(),
        };

        if (!Object.hasOwn(team, "teamMembers")) {
          team.teamMembers = [];
        }

        // Mentor object related to that Team because only ID of mentor is there
        refFaculty.get().then((snapshot) => {

          snapshot.docs.forEach(async (doc) => {
            if (doc.id == team.faculty) {
              let obj = { ...doc.data() };

              //get image of faculty
              const ref_ = storage_.ref(
                "teams/TeamPhotos/Faculty/" + obj.email
              );
              await ref_.getDownloadURL().then((url) => {
                obj.imageUrl = url;
                team.facultyObj = obj;

                var members = [];

                //To get image of team members
                if (Object.hasOwn(team, "teamMembers")) {
                  let flg = 0;
                  let len = team.teamMembers.length;
                  team.teamMembers.forEach(async (obj) => {
                    let objTemp = { ...obj };
                    const ref_ = storage_.ref(
                      "teams/TeamPhotos/TeamMembers/" + year + "/" + obj.email
                    );
                    await ref_.getDownloadURL().then((url) => {
                      objTemp.url = url;
                      members.push(objTemp);
                    });
                    flg = flg + 1;

                    // After Getting image of all members this will execute
                    if (len == flg) {
                      team.members = members;
                      delete team.teamMembers;
                      delete team.faculty;
                      res.json({ team: team });
                    }
                  });
                }
              });
            }
          });
        });
      }
    });
  });
});

router.get("/getYears", async (req, res) => {
  var ref = db.collection("AllTeams");
  var result = [];
  ref.get().then((snapshot) => {
    snapshot.docs.forEach((doc) => {
      var temp_res = {
        id: doc.id,
        year: doc.data().year,
      };
      result.push(temp_res);
    });
    res.json({ allTeam: result });
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
