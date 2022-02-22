let fs = require("fs");

if (process.env.FLY_REGION === process.env.FLY_PRIMARY_REGION) {
  console.log("COPYING PRIMARY LITESTREAM CONFIG");
  fs.copyFileSync("/etc/litestream.primary.yml", "/etc/litestream.yml");
} else {
  console.log("COPYING REPLICA LITESTREAM CONFIG");
  fs.copyFileSync("/etc/litestream.replica.yml", "/etc/litestream.yml");
}
