
import type { Request, Response } from "express";
import { EmployeeModel } from "../models/employee.model";

function validateEmployee(body: unknown) {
  const { name, email, role } =
    body && typeof body === "object"
      ? (body as Record<string, unknown>)
      : {};

  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof role !== "string" ||
    !name.trim() ||
    name.trim().length > 100 ||
    !email.trim() ||
    email.trim().length > 255 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
    !role.trim() ||
    role.trim().length > 100
  ) {
    return null;
  }

  return {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    role: role.trim(),
  };
}

// Updated: safely accepts unknown values, including string arrays.
function validId(value: unknown): number | null {
  if (typeof value !== "string" || !/^\d+$/.test(value)) {
    return null;
  }

  const id = Number(value);

  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

function handleError(res: Response, error: unknown) {
  console.error(error);

  const code = (error as { code?: string })?.code;

  if (code === "23505" || code === "23514") {
    return res.status(409).json({
      message:
        code === "23505"
          ? "An employee with this email already exists"
          : "The employee data violates a database constraint",
    });
  }

  return res.status(500).json({
    message: "Internal server error",
  });
}

export const EmployeeController = {
  async getAll(req: Request, res: Response) {
    try {
      const page = Number(req.query.page ?? 1);
      const limit = Number(req.query.limit ?? 5);
      const search =
        typeof req.query.search === "string" ? req.query.search : "";

      if (
        !Number.isSafeInteger(page) ||
        page < 1 ||
        !Number.isSafeInteger(limit) ||
        limit < 1 ||
        limit > 100
      ) {
        return res.status(400).json({
          message: "Page must be positive and limit must be between 1 and 100",
        });
      }

      const result = await EmployeeModel.findAll(page, limit, search);

      return res.status(200).json(result);
    } catch (error) {
      return handleError(res, error);
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const id = validId(req.params.id);

      if (id === null) {
        return res.status(400).json({ message: "Invalid employee ID" });
      }

      const employee = await EmployeeModel.findById(id);

      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      return res.status(200).json(employee);
    } catch (error) {
      return handleError(res, error);
    }
  },

  async create(req: Request, res: Response) {
    try {
      const input = validateEmployee(req.body);

      if (!input) {
        return res.status(400).json({
          message: "Valid name, email and role are required",
        });
      }

      const employee = await EmployeeModel.create(input);

      return res.status(201).json(employee);
    } catch (error) {
      return handleError(res, error);
    }
  },

  async update(req: Request, res: Response) {
    try {
      const id = validId(req.params.id);

      if (id === null) {
        return res.status(400).json({ message: "Invalid employee ID" });
      }

      const input = validateEmployee(req.body);

      if (!input) {
        return res.status(400).json({
          message: "Valid name, email and role are required",
        });
      }

      const employee = await EmployeeModel.update(id, input);

      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      return res.status(200).json(employee);
    } catch (error) {
      return handleError(res, error);
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const id = validId(req.params.id);

      if (id === null) {
        return res.status(400).json({ message: "Invalid employee ID" });
      }

      const deleted = await EmployeeModel.delete(id);

      if (!deleted) {
        return res.status(404).json({ message: "Employee not found" });
      }

      return res.status(204).end();
    } catch (error) {
      return handleError(res, error);
    }
  },
};
