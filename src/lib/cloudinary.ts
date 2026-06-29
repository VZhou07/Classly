import { Cloudinary } from "@cloudinary/url-gen";
import { fill } from "@cloudinary/url-gen/actions/resize";
import { dpr, format, quality } from "@cloudinary/url-gen/actions/delivery";
import { CLOUDINARY_CLOUD_NAME } from "@/constants";
import { source } from "@cloudinary/url-gen/actions/overlay";
import { text } from "@cloudinary/url-gen/qualifiers/source";
import { TextStyle } from "@cloudinary/url-gen/qualifiers/textStyle";
import { compass } from "@cloudinary/url-gen/qualifiers/gravity";
import { Position } from "@cloudinary/url-gen/qualifiers/position";

const cld = new Cloudinary({ cloud: { cloudName: CLOUDINARY_CLOUD_NAME } });

export const bannerPhoto = (imageCldPubId: string,name:string) =>
    cld
    .image(imageCldPubId)
    .resize(fill().height(2000))
    .delivery(format("auto"))
    .delivery(quality("auto"))
    .delivery(dpr("auto"))
    .overlay(
    source(
        text(name??"", new TextStyle("Arial", 80).fontWeight("bold")).textColor("white")
    ).position(
        new Position().gravity(compass("west")).offsetX(0.02).offsetY(0.1)
    )
    );

export default cld;
