// Twitter card reuses the branded card from the opengraph image
export { default, alt, size, contentType } from "./opengraph-image";
// must be declared directly (not re-exported) to register as route config
export const dynamic = "force-static";
