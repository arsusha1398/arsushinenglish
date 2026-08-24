export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15";
  };
  public: {
    Tables: {
      balance_transactions: {
        Row: {
          comment: string | null;
          created_at: string;
          created_by: string | null;
          delta: number;
          id: string;
          lesson_id: string | null;
          payment_id: string | null;
          reason: Database["public"]["Enums"]["tx_reason"];
          student_id: string;
        };
        Insert: {
          comment?: string | null;
          created_at?: string;
          created_by?: string | null;
          delta: number;
          id?: string;
          lesson_id?: string | null;
          payment_id?: string | null;
          reason: Database["public"]["Enums"]["tx_reason"];
          student_id: string;
        };
        Update: {
          comment?: string | null;
          created_at?: string;
          created_by?: string | null;
          delta?: number;
          id?: string;
          lesson_id?: string | null;
          payment_id?: string | null;
          reason?: Database["public"]["Enums"]["tx_reason"];
          student_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "balance_transactions_lesson_id_fkey";
            columns: ["lesson_id"];
            isOneToOne: false;
            referencedRelation: "lessons";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "balance_transactions_payment_id_fkey";
            columns: ["payment_id"];
            isOneToOne: false;
            referencedRelation: "payments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "balance_transactions_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "student_balances";
            referencedColumns: ["student_id"];
          },
          {
            foreignKeyName: "balance_transactions_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          },
        ];
      };
      homework: {
        Row: {
          body: string | null;
          created_at: string;
          due_date: string | null;
          grammar_topic: string | null;
          id: string;
          lesson_id: string | null;
          status: Database["public"]["Enums"]["hw_status"];
          student_id: string;
          title: string;
        };
        Insert: {
          body?: string | null;
          created_at?: string;
          due_date?: string | null;
          grammar_topic?: string | null;
          id?: string;
          lesson_id?: string | null;
          status?: Database["public"]["Enums"]["hw_status"];
          student_id: string;
          title: string;
        };
        Update: {
          body?: string | null;
          created_at?: string;
          due_date?: string | null;
          grammar_topic?: string | null;
          id?: string;
          lesson_id?: string | null;
          status?: Database["public"]["Enums"]["hw_status"];
          student_id?: string;
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: "homework_lesson_id_fkey";
            columns: ["lesson_id"];
            isOneToOne: false;
            referencedRelation: "lessons";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "homework_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "student_balances";
            referencedColumns: ["student_id"];
          },
          {
            foreignKeyName: "homework_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          },
        ];
      };
      lessons: {
        Row: {
          comment: string | null;
          created_at: string;
          duration_minutes: number;
          format: Database["public"]["Enums"]["lesson_format"];
          id: string;
          rescheduled_from: string | null;
          starts_at: string;
          status: Database["public"]["Enums"]["lesson_status"];
          student_id: string;
        };
        Insert: {
          comment?: string | null;
          created_at?: string;
          duration_minutes?: number;
          format?: Database["public"]["Enums"]["lesson_format"];
          id?: string;
          rescheduled_from?: string | null;
          starts_at: string;
          status?: Database["public"]["Enums"]["lesson_status"];
          student_id: string;
        };
        Update: {
          comment?: string | null;
          created_at?: string;
          duration_minutes?: number;
          format?: Database["public"]["Enums"]["lesson_format"];
          id?: string;
          rescheduled_from?: string | null;
          starts_at?: string;
          status?: Database["public"]["Enums"]["lesson_status"];
          student_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "lessons_rescheduled_from_fkey";
            columns: ["rescheduled_from"];
            isOneToOne: false;
            referencedRelation: "lessons";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "lessons_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "student_balances";
            referencedColumns: ["student_id"];
          },
          {
            foreignKeyName: "lessons_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          },
        ];
      };
      materials: {
        Row: {
          body: string | null;
          created_at: string;
          id: string;
          kind: string;
          student_id: string | null;
          title: string;
          url: string | null;
        };
        Insert: {
          body?: string | null;
          created_at?: string;
          id?: string;
          kind?: string;
          student_id?: string | null;
          title: string;
          url?: string | null;
        };
        Update: {
          body?: string | null;
          created_at?: string;
          id?: string;
          kind?: string;
          student_id?: string | null;
          title?: string;
          url?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "materials_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "student_balances";
            referencedColumns: ["student_id"];
          },
          {
            foreignKeyName: "materials_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          },
        ];
      };
      packages: {
        Row: {
          created_at: string;
          currency: string;
          description: string | null;
          id: string;
          is_active: boolean;
          lessons_count: number;
          price: number;
          sort_order: number;
          title: string;
        };
        Insert: {
          created_at?: string;
          currency?: string;
          description?: string | null;
          id?: string;
          is_active?: boolean;
          lessons_count: number;
          price: number;
          sort_order?: number;
          title: string;
        };
        Update: {
          created_at?: string;
          currency?: string;
          description?: string | null;
          id?: string;
          is_active?: boolean;
          lessons_count?: number;
          price?: number;
          sort_order?: number;
          title?: string;
        };
        Relationships: [];
      };
      payments: {
        Row: {
          amount: number;
          comment: string | null;
          created_at: string;
          created_by: string | null;
          currency: string;
          id: string;
          lessons_bought: number;
          method: string;
          paid_at: string;
          student_id: string;
        };
        Insert: {
          amount: number;
          comment?: string | null;
          created_at?: string;
          created_by?: string | null;
          currency?: string;
          id?: string;
          lessons_bought: number;
          method?: string;
          paid_at?: string;
          student_id: string;
        };
        Update: {
          amount?: number;
          comment?: string | null;
          created_at?: string;
          created_by?: string | null;
          currency?: string;
          id?: string;
          lessons_bought?: number;
          method?: string;
          paid_at?: string;
          student_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "payments_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "student_balances";
            referencedColumns: ["student_id"];
          },
          {
            foreignKeyName: "payments_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          },
        ];
      };
      pricing_plans: {
        Row: {
          created_at: string;
          currency: string;
          duration_minutes: number;
          id: string;
          price_per_lesson: number;
          student_id: string;
          valid_from: string;
          valid_to: string | null;
        };
        Insert: {
          created_at?: string;
          currency?: string;
          duration_minutes?: number;
          id?: string;
          price_per_lesson: number;
          student_id: string;
          valid_from?: string;
          valid_to?: string | null;
        };
        Update: {
          created_at?: string;
          currency?: string;
          duration_minutes?: number;
          id?: string;
          price_per_lesson?: number;
          student_id?: string;
          valid_from?: string;
          valid_to?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "pricing_plans_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "student_balances";
            referencedColumns: ["student_id"];
          },
          {
            foreignKeyName: "pricing_plans_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          created_at: string;
          email: string | null;
          full_name: string | null;
          id: string;
        };
        Insert: {
          created_at?: string;
          email?: string | null;
          full_name?: string | null;
          id: string;
        };
        Update: {
          created_at?: string;
          email?: string | null;
          full_name?: string | null;
          id?: string;
        };
        Relationships: [];
      };
      progress_entries: {
        Row: {
          comment: string | null;
          created_at: string;
          id: string;
          level: Database["public"]["Enums"]["eng_level"];
          student_id: string;
        };
        Insert: {
          comment?: string | null;
          created_at?: string;
          id?: string;
          level: Database["public"]["Enums"]["eng_level"];
          student_id: string;
        };
        Update: {
          comment?: string | null;
          created_at?: string;
          id?: string;
          level?: Database["public"]["Enums"]["eng_level"];
          student_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "progress_entries_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "student_balances";
            referencedColumns: ["student_id"];
          },
          {
            foreignKeyName: "progress_entries_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          },
        ];
      };
      site_content: {
        Row: {
          key: string;
          updated_at: string;
          value: string;
        };
        Insert: {
          key: string;
          updated_at?: string;
          value?: string;
        };
        Update: {
          key?: string;
          updated_at?: string;
          value?: string;
        };
        Relationships: [];
      };
      student_notes: {
        Row: {
          author: string | null;
          body: string;
          created_at: string;
          id: string;
          student_id: string;
        };
        Insert: {
          author?: string | null;
          body: string;
          created_at?: string;
          id?: string;
          student_id: string;
        };
        Update: {
          author?: string | null;
          body?: string;
          created_at?: string;
          id?: string;
          student_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "student_notes_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "student_balances";
            referencedColumns: ["student_id"];
          },
          {
            foreignKeyName: "student_notes_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          },
        ];
      };
      students: {
        Row: {
          created_at: string;
          email: string | null;
          format: Database["public"]["Enums"]["lesson_format"];
          full_name: string;
          goal: string | null;
          id: string;
          is_active: boolean;
          level: Database["public"]["Enums"]["eng_level"];
          phone: string | null;
          start_date: string;
          target_level: Database["public"]["Enums"]["eng_level"] | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string;
          email?: string | null;
          format?: Database["public"]["Enums"]["lesson_format"];
          full_name: string;
          goal?: string | null;
          id?: string;
          is_active?: boolean;
          level?: Database["public"]["Enums"]["eng_level"];
          phone?: string | null;
          start_date?: string;
          target_level?: Database["public"]["Enums"]["eng_level"] | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          email?: string | null;
          format?: Database["public"]["Enums"]["lesson_format"];
          full_name?: string;
          goal?: string | null;
          id?: string;
          is_active?: boolean;
          level?: Database["public"]["Enums"]["eng_level"];
          phone?: string | null;
          start_date?: string;
          target_level?: Database["public"]["Enums"]["eng_level"] | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      student_balances: {
        Row: {
          balance: number | null;
          student_id: string | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      adjust_balance: {
        Args: { _comment: string; _delta: number; _student_id: string };
        Returns: undefined;
      };
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
      is_admin: { Args: never; Returns: boolean };
      owns_student: { Args: { _student_id: string }; Returns: boolean };
      record_payment: {
        Args: {
          _amount: number;
          _comment: string;
          _currency?: string;
          _lessons: number;
          _method: string;
          _student_id: string;
        };
        Returns: string;
      };
      reschedule_lesson: {
        Args: { _lesson_id: string; _new_starts_at: string };
        Returns: string;
      };
      set_lesson_status: {
        Args: {
          _charge?: boolean;
          _lesson_id: string;
          _status: Database["public"]["Enums"]["lesson_status"];
        };
        Returns: undefined;
      };
    };
    Enums: {
      app_role: "admin" | "student";
      eng_level: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
      hw_status: "new" | "in_progress" | "submitted" | "reviewed";
      lesson_format: "online" | "offline";
      lesson_status: "scheduled" | "completed" | "cancelled" | "rescheduled" | "no_show";
      tx_reason:
        "payment" | "lesson_completed" | "manual_correction" | "no_show_charge" | "reversal";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "student"],
      eng_level: ["A1", "A2", "B1", "B2", "C1", "C2"],
      hw_status: ["new", "in_progress", "submitted", "reviewed"],
      lesson_format: ["online", "offline"],
      lesson_status: ["scheduled", "completed", "cancelled", "rescheduled", "no_show"],
      tx_reason: ["payment", "lesson_completed", "manual_correction", "no_show_charge", "reversal"],
    },
  },
} as const;
