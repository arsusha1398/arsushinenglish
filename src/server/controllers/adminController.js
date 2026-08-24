import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getStudents = async (req, res, next) => {
  try {
    const { search, level, status, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      ...(search && { name: { contains: search, mode: "insensitive" } }),
      ...(level && { level }),
      ...(status && { status }),
    };

    const students = await prisma.student.findMany({
      where,
      skip,
      take: parseInt(limit),
      include: {
        _count: { select: { lessons: true } },
      },
    });

    res.json(students);
  } catch (error) {
    next(error);
  }
};

export const getDashboardStats = async (req, res, next) => {
  try {
    const totalStudents = await prisma.student.count();
    const activeStudents = await prisma.student.count({ where: { status: "active" } });

    // Пример агрегации (сумма всех транзакций)
    const totalBalance = await prisma.balanceTransaction.aggregate({
      _sum: { amount: true },
    });

    res.json({
      totalStudents,
      activeStudents,
      totalBalance: totalBalance._sum.amount,
    });
  } catch (error) {
    next(error);
  }
};
