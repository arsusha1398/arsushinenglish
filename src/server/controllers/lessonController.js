import { PrismaClient } from "@prisma/client";
import * as balanceService from "../services/balanceService.js";

const prisma = new PrismaClient();

export const createLesson = async (req, res, next) => {
  try {
    const { studentId, dateTime } = req.body;
    const lesson = await prisma.lesson.create({
      data: { studentId, dateTime: new Date(dateTime) },
    });
    res.status(201).json(lesson);
  } catch (error) {
    next(error);
  }
};

export const updateLessonStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const lesson = await prisma.lesson.findUnique({ where: { id } });
    if (!lesson) return res.status(404).json({ error: "Lesson not found" });

    if (status === "COMPLETED") {
      await balanceService.completeLesson(lesson.studentId, id);
    } else if (status === "CANCELLED") {
      await balanceService.cancelLesson(lesson.studentId, id);
    } else {
      await prisma.lesson.update({ where: { id }, data: { status } });
    }

    res.json({ message: "Status updated" });
  } catch (error) {
    next(error);
  }
};
