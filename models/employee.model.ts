
import { supabase } from "../config/db";

export interface EmployeeInput {
  name: string;
  email: string;
  role: string;
}

export const EmployeeModel = {
  async findAll(page = 1, limit = 5, search = "") {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from("employees")
      .select("*", { count: "exact" });

    if (search.trim()) {
      query = query.ilike("name", `%${search.trim()}%`);
    }

    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) throw error;

    const total = count ?? 0;

    return {
      data: data ?? [],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async findById(id: number) {
    const { data, error } = await supabase
      .from("employees")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async create(input: EmployeeInput) {
    const { data, error } = await supabase
      .from("employees")
      .insert(input)
      .select("*")
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: number, input: EmployeeInput) {
    const { data, error } = await supabase
      .from("employees")
      .update(input)
      .eq("id", id)
      .select("*")
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async delete(id: number) {
    const { data, error } = await supabase
      .from("employees")
      .delete()
      .eq("id", id)
      .select("id")
      .maybeSingle();

    if (error) throw error;
    return data !== null;
  },
};
