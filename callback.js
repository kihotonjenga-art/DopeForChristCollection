export default function handler(req, res) {
   console.log(req.body);

   res.status(200).json({
      ResultCode: 0,
      ResultDesc: "Accepted"
   });
  }
