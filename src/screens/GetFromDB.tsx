import { supabase } from "../lib/supabase";
import React from "react";

export default async function getFromDB(
  fromScreen: "feed" | "inbox" | "profile",
  emailHandle: string,
  selectedLocation: string,
  selectedDate: Date | null,
  selectedStartTime: Date | null,
  selectedEndTime: Date | null,
  setPosts: React.Dispatch<React.SetStateAction<PostProps[]>>
) {
  const email = emailHandle + "@ucsc.edu";

  let query = supabase
    .from("Posts")
    .select()
    .order("startTime", { ascending: true });

  if (fromScreen === "feed") {
    query = query.neq("studentEmail", email);

    if (selectedLocation && selectedLocation !== "select location" && selectedLocation !== "All") {
      query = query.eq("location", selectedLocation);
    }

    // Filter by specific date
      if (selectedDate) {
        const startOfDay = new Date(selectedDate);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(selectedDate);
        endOfDay.setHours(23, 59, 59, 999);

        query = query.gte("startTime", startOfDay.toISOString()).lte("startTime", endOfDay.toISOString());
      }

      // Filter by starting time (only if chosen)
      /*if (selectedStartTime) {
        query = query.gt("endTime", selectedStartTime.toISOString());
      }*/

      if (selectedStartTime || selectedEndTime) {
        let S: string | null = null;
        let E: string | null = null;

        // Combine date + time so your timestamps land on the same day
        if (selectedDate && selectedStartTime) {
          const d = new Date(selectedDate);
          d.setHours(selectedStartTime.getHours(), selectedStartTime.getMinutes(), 0, 0);
          S = d.toISOString();
        }

        if (selectedDate && selectedEndTime) {
          const d = new Date(selectedDate);
          d.setHours(selectedEndTime.getHours(), selectedEndTime.getMinutes(), 0, 0);
          E = d.toISOString();
        }

        // Overlap condition: PostEnd >= S AND PostStart <= E
        if (S) query = query.gte("endTime", S);
        if (E) query = query.lte("startTime", E);
      }

  } else if (fromScreen === "inbox") {
    query = query.contains("reservation", [emailHandle]);
  } else if (fromScreen === "profile") {
    query = query.eq("studentEmail", email);
  }

  const { data, error } = await query;

  if (error) {
    console.log("err", error);
    setPosts([]);
  } else if (data) {
    // Filter out posts created by the current user so they don't appear in the main feed

    setPosts(
      data.map((val) => {
        return {
          id: val["postID"],
          location: val["location"],
          startTime: val["startTime"],
          endTime: val["endTime"] || val["startTime"],
          name: val["name"],
          isPoster: fromScreen === "profile",
          fromScreen: fromScreen,
        };
      })
    );
  }
}
