const express = require("express");
const { model } = require("mongoose");
const fetchuser = require(".././middleware/fetchuser");
const Note = require("../models/Notes");
const router = express.Router();
const { body, validationResult } = require("express-validator");

// Route 1:  Get All Notes Using: Get "/api/notes/fetchallnotes/".  require login

router.get("/fetchallnotes", fetchuser, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id });
    res.json(notes);
  } catch (error) {
    res.status(500).send("Some Server error!!!!!!");
  }
});

// Route 2:  Add new Note Using: post "/api/notes/addnote".  require login

router.post(
  "/addnote",
  fetchuser,
  [
    body("title", "Enter a valid Title").isLength({ min: 3 }),
    body("description", "Enter at least 5 char description").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    try {
      const { title, description, tag } = req.body;

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const note = new Note({
        title,
        description,
        tag,
        user: req.user.id,
      });
      const savedNote = await note.save();

      res.json(savedNote);
    } catch (error) {
      res.status(500).send("Some Server error!!!!!!");
    }
  }
);

// Route 3:  Update existing Note Using: put "/api/notes/updatenote/".  require login

router.put("/updatenote/:id", fetchuser, async (req, res) => {
  try {
    const { title, description, tag } = req.body;

    // Create a new Note object
    const newNote = {};
    if (title) {
      newNote.title = title;
    }
    if (description) {
      newNote.description = description;
    }
    if (tag) {
      newNote.tag = tag;
    }

    // Find the note to be update

    let note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).send("Not Found");
    }

    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("Not Allowed");
    }

    note = await Note.findByIdAndUpdate(
      req.params.id,
      { $set: newNote },
      { new: true }
    );
    res.json({ note });
  } catch (error) {
    res.status(500).send("Some Server error!!!!!!");
  }
});



// Route 4:  Delete Note Using: Get "/api/notes/deletenote/".  require login

router.delete("/deletenote/:id", fetchuser, async (req, res) => {
    try {
      const { title, description, tag } = req.body;
  
  
      // Find the note to be Deleted
  
      let note = await Note.findById(req.params.id);
      if (!note) {
        return res.status(404).send("Not Found");
      }
  
    //   Allow Delete if user own it

      if (note.user.toString() !== req.user.id) {
        return res.status(401).send("Not Allowed");
      }
  
      note = await Note.findByIdAndDelete(req.params.id);
      res.json({ "Sucsess": "Note has been Deleted"});
    } catch (error) {
      res.status(500).send("Some Server error!!!!!!");
    }
  });
  


module.exports = router;
