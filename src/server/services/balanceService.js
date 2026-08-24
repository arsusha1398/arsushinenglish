import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getStudentBalance = async (studentId) => {
  const transactions = await prisma.balanceTransaction.findMany({
    where: { studentId },
  });

  return transactions.reduce((acc, curr) => acc + Number(curr.amount), 0);
};

export const recordPayment = async (studentId, amount, lessonCount, comment) => {
  return await prisma.$transaction(async (tx) => {
    // 1. Создаем запись транзакции
    await tx.balanceTransaction.create({
      data: {
        studentId,
        amount: amount,
        type: "PAYMENT",
        reason: comment || "Payment for lessons",
      },
    });

    // В будущем здесь будет логика обновления поля "lessonsAvailable" или похожего,
    // но по ТЗ баланс = сумма транзакций.
  });
};

export const completeLesson = async (studentId, lessonId) => {
  return await prisma.$transaction(async (tx) => {
    // Проверка на дубль
    const existing = await tx.balanceTransaction.findUnique({
      where: { lessonId },
    });

    if (existing) throw new Error("Lesson already processed");

    // Списываем 1 занятие (отрицательная сумма)
    await tx.balanceTransaction.create({
      data: {
        studentId,
        amount: -1,
        type: "LESSON_COMPLETED",
        lessonId: lessonId,
      },
    });

    await tx.lesson.update({
      where: { id: lessonId },
      data: { status: "COMPLETED" },
    });
  });
};

export const cancelLesson = async (studentId, lessonId) => {
  return await prisma.$transaction(async (tx) => {
    // Ищем транзакцию списания за этот урок
    const transaction = await tx.balanceTransaction.findUnique({
      where: { lessonId },
    });

    if (!transaction) {
      await tx.lesson.update({
        where: { id: lessonId },
        data: { status: "CANCELLED" },
      });
      return;
    }

    // Создаем компенсирующую транзакцию
    await tx.balanceTransaction.create({
      data: {
        studentId,
        amount: Math.abs(Number(transaction.amount)),
        type: "CANCELLATION_REFUND",
        reason: "Refund for cancelled lesson",
      },
    });

    await tx.lesson.update({
      where: { id: lessonId },
      data: { status: "CANCELLED" },
    });
  });
};
