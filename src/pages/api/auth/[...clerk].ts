import { getAuth } from "@clerk/nextjs/server";
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = getAuth(req);
  
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  
  // This is just a sample endpoint to verify authentication
  // You can customize this based on your needs
  return res.status(200).json({ 
    success: true, 
    message: "Authentication successful",
    userId
  });
}