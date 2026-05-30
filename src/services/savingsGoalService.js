import prisma from "./database.js";

export const getAllSavingsGoals = async () => {
  try {
    return await prisma.savingsGoal.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
  } catch (error) {
    console.error("Error fetching savings goals:", error);
    throw error;
  }
};

export const createSavingsGoal = async (data) => {
  try {
    return await prisma.savingsGoal.create({
      data: {
        title: data.title,
        target: parseFloat(data.target),
        current: parseFloat(data.current || 0),
      },
    });
  } catch (error) {
    console.error("Error creating savings goal:", error);
    throw error;
  }
};

export const updateSavingsGoal = async (id, data) => {
  try {
    return await prisma.savingsGoal.update({
      where: { id: parseInt(id) },
      data: {
        title: data.title,
        target: data.target ? parseFloat(data.target) : undefined,
        current: data.current ? parseFloat(data.current) : undefined,
      },
    });
  } catch (error) {
    console.error("Error updating savings goal:", error);
    throw error;
  }
};

export const deleteSavingsGoal = async (id) => {
  try {
    return await prisma.savingsGoal.delete({
      where: { id: parseInt(id) },
    });
  } catch (error) {
    console.error("Error deleting savings goal:", error);
    throw error;
  }
};
