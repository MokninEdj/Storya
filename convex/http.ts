import { HttpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { Webhook } from "svix";
import { api } from "./_generated/api";

const http = new HttpRouter();
http.route({
  method: "POST",
  path: "/clerk-webhook",
  handler: httpAction(async (ctx, request) => {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET!;
    if (!webhookSecret) {
      throw new Error("Webhook secret not found");
    }

    // Check headers
    const svix_id = request.headers.get("svix-id");
    const svix_timestamp = request.headers.get("svix-timestamp");
    const svix_signature = request.headers.get("svix-signature");

    if (!svix_id || !svix_timestamp || !svix_signature) {
      return new Response("Missing headers", { status: 400 });
    }

    // Parse body
    const payload = await request.json();
    const body = JSON.stringify(payload);

    const wh = new Webhook(webhookSecret);
    let evt: any;
    try {
      evt = wh.verify(body, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      });
    } catch (error) {
      console.log("error", error);
      return new Response("Error occured", { status: 500 });
    }

    const eventType = evt.type;
    if (eventType === "user.created") {
      const { id, first_name, last_name, email_addresses, image_url } =
        evt.data;
      const email = email_addresses[0].email_address;
      const name = `${first_name || ""} ${last_name || ""}`;
      try {
        await ctx.runMutation(api.users.createUser, {
          email,
          fullName: name,
          clerkId: id,
          username: email.split("@")[0],
          image: image_url,
        });
      } catch (error) {
        console.log("err", error);
        return new Response("Error occured", { status: 500 });
      }
    }
    return new Response("OK", { status: 200 });
  }),
});

export default http;
