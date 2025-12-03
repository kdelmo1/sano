import { supabase } from "../lib/supabase";

export default async function getFromDB(
  fromScreen: "feed" | "inbox" | "profile",
  emailHandle: string,
  setPosts: React.Dispatch<React.SetStateAction<PostProps[]>>,
  selectedLocation: string = "",
  selectedDate: Date | null = null,
  selectedStartTime: Date | null = null,
  selectedTag: string | null = null
) {
  const email = emailHandle + "@ucsc.edu";

  const toLocalISOWithTimezone = (date: Date) => {
    const pad = (n: number) => String(n).padStart(2, "0");

    const offset = -date.getTimezoneOffset();
    const sign = offset >= 0 ? "+" : "-";
    const absOffset = Math.abs(offset);

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
      date.getDate()
    )}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
      date.getSeconds()
    )}${sign}${pad(Math.floor(absOffset / 60))}:${pad(absOffset % 60)}`;
  };

  const [nowDate, nowTime] = toLocalISOWithTimezone(new Date()).split("T");

  let query = supabase
    .from("Posts")
    .select()
    .order("date", { ascending: true })
    .order("endTime", { ascending: true })
    .or(`date.gt.${nowDate},and(date.eq.${nowDate},endTime.gt.${nowTime})`);

  if (fromScreen === "feed") {
    // Filter out posts created by the current user so they don't appear in the main feed
    query = query.neq("studentEmail", email);

    if (selectedLocation && selectedLocation !== "All Location") {
      query = query.eq("location", selectedLocation);
    }

    // Filter by specific date
    if (selectedDate) {
      query = query.eq("date", toLocalISOWithTimezone(selectedDate).split("T"));
    }

    // Filter with times
    if (selectedStartTime) {
      const startTime = toLocalISOWithTimezone(selectedStartTime).split("T");
      query = query.lte("startTime", startTime);
      query = query.gte("endTime", startTime);
    }

    if (selectedTag && selectedTag !== "All Tags") {
      query = query.eq("is_food_giveaway", selectedTag === "Food Giveaway");
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
    // Filter out posts that are full for users who haven't reserved (only in feed)
    const filteredData = data.filter((val) => {
      if (fromScreen !== "feed") return true;
      const reservationArray: string[] = Array.isArray(val["reservation"])
        ? val["reservation"]
        : [];
      const slots: number = val["slots"] || 1;
      // Keep the post if there is space or if the current user is already reserved
      if (
        reservationArray.length >= slots &&
        !reservationArray.includes(emailHandle)
      ) {
        return false; // hide from feed for users not reserved
      }
      return true;
    });

    const posterEmailSet = new Set(
      filteredData.map((val) => {
        return val["studentEmail"];
      })
    );
    const { data: posterRatings, error: ratingError } = await supabase
      .from("student")
      .select("email, rating, number_of_raters")
      .in("email", [...posterEmailSet]);
    const posterRatingRecord = posterRatings?.reduce((rating, student) => {
      if (student["number_of_raters"] >= 5)
        rating[student["email"]] =
          (student["rating"] / student["number_of_raters"]) * 10;
      else rating[student["email"]] = "X";
      return rating;
    }, {} as Record<string, number | "X">);

    if (ratingError) console.error(ratingError);
    else {
      setPosts(
        filteredData.map((val) => {
          let photoUrls: string[] = [];
          if (val["photo_url"]) {
            try {
              photoUrls = JSON.parse(val["photo_url"]);
              if (!Array.isArray(photoUrls)) {
                photoUrls = [];
              }
            } catch (e) {
              photoUrls = [];
            }
          }

          //const reservationArray: string[] = Array.isArray(val["reservation"]) ? val["reservation"] : [];
          return {
            id: val["postID"],
            location: val["location"],
            startTime: `${val["date"]}T${val["startTime"]}:00`,
            endTime:
              `${val["date"]}T${val["endTime"]}:00` ||
              `${val["date"]}T${val["startTime"]}:00`,
            name: val["name"],
            slots: val["slots"] || 1,
            isPoster: fromScreen === "profile",
            fromScreen: fromScreen,
            isFoodGiveaway: val["is_food_giveaway"] || false,
            photoUrls: photoUrls,
            posterRating: posterRatingRecord?.[val["studentEmail"]],
            //reservePostInit: reservationArray.includes(emailHandle),
            reservePostInit: val["reservation"].includes(emailHandle),
            refreshHome: () => {},
          };
        })
      );
    }
  }
}
