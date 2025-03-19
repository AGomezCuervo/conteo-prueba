import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"
import { errorMessages } from "@/lib/errors";
import { toast } from "sonner";

/* Back */
export function makeResponse(succeed, errorCode, payload) {

  if (arguments.length > 3) {
    console.error("[FUNCTION ERROR] makeResponse: Too many arguments, expected 1 to 3");
    return SERVER_ERROR;
  }


  if (succeed) {
    if (arguments.length === 1)
      return { succeed };
    else
    return { succeed, payload };
  } else {
    const message = errorMessages.get(errorCode);
    return { succeed, message };
  }
}


/* Front */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function showToast(state, message) {
  if(!state)
    return false

  if(state.succeed === false) {
    toast.error(state.message, {
      classNames: {
        title: "text-lg"
      }
    })
    return false
  }

  if(state.succeed === true) {
    toast.success(message, {
      classNames: {
        title: "text-lg"
      }
    })
    return true
  }
}
