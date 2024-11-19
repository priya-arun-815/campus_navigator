// routes.ts
import express, { Request, Response } from "express";
import { usersCollection, buildingsCollection } from "./database";
import { User } from "../../models/User";
import { Building } from "../../models/Building";
import { ObjectId } from "mongodb";

const router = express.Router();

router.get("/api/users", async (req: Request, res: Response) => {
  try {
    const users = await usersCollection.find<User>({}).toArray();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users", error });
  }
});

// POST a new user
router.post("/api/users", async (req: Request, res: Response) => {
  const newUser: User = req.body;

  try {
    const result = await usersCollection.insertOne(newUser);
    res.status(201).json({
      message: "User created successfully",
      userId: result.insertedId,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to create user", error });
  }
});

// PATCH a user by ID
router.patch("/api/users/:id", async (req: Request, res: Response) => {
  const userId = req.params.id;
  const updates = req.body;

  try {
    await usersCollection.updateOne({ id: userId }, { $set: updates });
    res.status(201).json({
      message: "User updated successfully",
      userId: userId,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to create user", error });
  }
});

// GET a user by ID
router.get("/api/users/:id", async (req: Request, res: Response) => {
  const userId = req.params.id;

  try {
    const user = await usersCollection.findOne<User>({
      id: userId,
    });

    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error fetching user", error });
  }
});

router.get("/api/buildings", async (req: Request, res: Response) => {
  const search = req.query.search as string;

  try {
    const query = search ? { name: { $regex: search, $options: "i" } } : {};
    const buildings = await buildingsCollection.find<Building>(query).toArray();
    res.status(200).json(buildings);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch buildings", error });
  }
});

router.get("/api/buildings/:id", async (req: Request, res: Response) => {
  const buildingId = req.params.id;

  if (!ObjectId.isValid(buildingId)) {
    return res.status(400).json({ message: "Invalid building ID" });
  }

  try {
    const building = await buildingsCollection.findOne<Building>({
      _id: new ObjectId(buildingId),
    });

    if (building) {
      res.status(200).json(building);
    } else {
      res.status(404).json({ message: "Building not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error fetching building", error });
  }
});

export default router;
