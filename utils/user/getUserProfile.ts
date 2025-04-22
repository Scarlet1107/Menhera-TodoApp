// // utils/user/getUserProfile.ts

// import { prisma } from "@/lib/prisma";
// import { getAuthUser } from "@/utils/supabase/getAuthUser";

// /**
//  * Prismaのプロフィールを取得します。
//  * @param userId 任意のSupabaseのユーザーID。省略時はログインユーザーから取得します。(2重フェッチのためパフォーマンスx)
//  */
// export const getUserProfile = async (userId?: string) => {
//   const uid = userId ?? (await getAuthUser()).id;

//   const profile = await prisma.profile.findUnique({
//     where: { userId: uid },
//   });

//   if (!profile) {
//     throw new Error("プロフィールが存在しません");
//   }

//   return profile;
// };

// ****ing prisma.
