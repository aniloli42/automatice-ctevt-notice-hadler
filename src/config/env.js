const config = {
  PORT: isNaN(+process.env.PORT) ? 8000 : +process.env.PORT,

  MONGODB_CONNECTION_URL: process.env.MONGODB_CONNECTION_URL ?? "",

  FACEBOOK_API_BASE_URL: process.env.FACEBOOK_API_BASE_URL ?? "",
  FACEBOOK_PAGE_ID: process.env.FACEBOOK_PAGE_ID ?? "",
  FACEBOOK_USER_ID: process.env.FACEBOOK_USER_ID ?? "",

  BITLY_ACCESS_TOKEN: process.env.BITLY_ACCESS_TOKEN ?? "",
  BITLY_API_URL: process.env.BITLY_API_URL ?? "",

  WEBSITE_URL: process.env.WEBSITE_URL ?? "",
};

const isEnvWithoutValues = Object.values(config).some((env) => env == "");

if (isEnvWithoutValues) {
  const envWithoutValues = Object.entries(config).reduce(
    (noValueEnvs, [key, value]) => {
      if (value == "") noValueEnvs.push(key);
      return noValueEnvs;
    },
    []
  );

  const errorMessage = `Env without values: ${envWithoutValues.join(", ")}`;
  throw new Error(errorMessage);
}

export { config };
