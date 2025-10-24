"use client";

import { useActionState, useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/submit-button";
import {
  updateDisplayNameAction,
  type UpdateDisplayNameState,
} from "@/app/protected/(app)/settings/actions";
import { toast } from "sonner";

const INITIAL_STATE: UpdateDisplayNameState = { status: "idle" };

type UpdateDisplayNameFormProps = {
  initialName: string;
};

export function UpdateDisplayNameForm({
  initialName,
}: UpdateDisplayNameFormProps) {
  const [name, setName] = useState(initialName);
  const [state, formAction] = useActionState(
    updateDisplayNameAction,
    INITIAL_STATE
  );

  useEffect(() => {
    if (!state.message) {
      return;
    }

    if (state.status === "success") {
      toast.success(state.message);
    }

    if (state.status === "error") {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <form action={formAction} className="space-y-2">
      <div className="space-y-2">
        <Label htmlFor="displayName">ユーザー名</Label>
        <Input
          id="displayName"
          name="displayName"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="ユーザー名を入力"
        />
      </div>
      <SubmitButton className="w-full" pendingText="更新中..." variant={"outline"}>
        更新する
      </SubmitButton>
    </form>
  );
}
