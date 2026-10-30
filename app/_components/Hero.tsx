import Image from "next/image";
import TableScene from "./TableScene";

// The hero has three fixed-size stages (desktop 1280, tablet 744, mobile 390),
// each centered and swapped at a breakpoint. Only the pool table scene moves
// continuously with width (see TableScene).

// Star decorations. `inset` is the star's offset within its square bounding box.
const STAR_INSET_LG = "inset-[8.23%_8.82%_10.56%_8.82%]";
const STAR_INSET_SM = "inset-[8.9%_9.47%_11.18%_9.47%]";

const RED = { src: "/hero/star-red.svg", w: 29.9892, h: 29.5714, inset: STAR_INSET_SM };
const YELLOW = { src: "/hero/star-yellow-1.svg", w: 50.239, h: 49.5335, inset: STAR_INSET_LG };
const BLUE = { src: "/hero/star-blue.svg", w: 75.7703, h: 74.7063, inset: STAR_INSET_LG };

type Star = typeof RED & { box: string };

const desktopStars: Star[] = [
  { ...RED, box: "left-[89px] top-[103px] size-[37px]" },
  { ...RED, box: "left-[857px] top-[275px] size-[37px]" },
  { ...YELLOW, box: "left-[670px] top-[103px] size-[61px]" },
  { ...YELLOW, box: "left-[251px] top-[613px] size-[61px]" },
  { ...BLUE, box: "left-[1057px] top-[140px] size-[92px]" },
  { ...BLUE, box: "left-[-44px] top-[421px] size-[92px]" },
];

// Figma 9026:1895
const tabletStars: Star[] = [
  { ...RED, box: "left-[136px] top-[26.34px] size-[37px]" },
  { ...RED, box: "left-[740px] top-[318px] size-[37px]" },
  { ...YELLOW, box: "left-[623px] top-[75.34px] size-[61px]" },
  { ...BLUE, box: "left-[78px] top-[380.34px] size-[92px]" },
];

// Figma 9026:2063
const mobileStars: Star[] = [
  { ...RED, box: "left-[46px] top-[45.34px] size-[37px]" },
  { ...RED, box: "left-[300px] top-[671.34px] size-[37px]" },
  { ...YELLOW, box: "left-[306px] top-[45.34px] size-[61px]" },
  { ...BLUE, box: "left-[112px] top-[606.34px] size-[92px]" },
];

function Stars({ stars }: { stars: Star[] }) {
  return stars.map((star, i) => (
    <div key={i} aria-hidden className={`absolute ${star.box}`}>
      <div className={`absolute ${star.inset}`}>
        <Image
          src={star.src}
          alt=""
          width={star.w}
          height={star.h}
          className="block size-full max-w-none"
        />
      </div>
    </div>
  ));
}

// "Stride" with the dot over the i. Sized by font-size so it scales per stage.
function Wordmark({ className }: { className: string }) {
  return (
    <h1 className={`relative whitespace-nowrap font-display leading-[1.4756] text-cream ${className}`}>
      Stride
      <Image
        src="/hero/stride-dot.svg"
        alt=""
        aria-hidden
        width={41.6614}
        height={41.6614}
        className="absolute left-[1.5441em] top-[0.4228em] size-[0.2637em] max-w-none"
      />
    </h1>
  );
}

function EventDetails({ date, iconClassName = "" }: { date: string; iconClassName?: string }) {
  return (
    <div className="flex flex-col gap-[9px] font-sans text-[16px] leading-none text-white">
      <p className="flex items-center gap-[8px]">
        <span className="whitespace-pre underline">{date}</span>
        <span className={`relative size-[20px] ${iconClassName}`}>
          <Image
            src="/hero/icon-calendar-add.svg"
            alt=""
            aria-hidden
            width={15.5026}
            height={15.8327}
            className="absolute left-[2.83px] top-[2.5px] max-w-none"
          />
        </span>
      </p>
      <p className="flex items-center gap-[8px]">
        <span className="underline">DIB 208</span>
        <span className={`relative size-[20px] ${iconClassName}`}>
          <Image
            src="/hero/icon-location.svg"
            alt=""
            aria-hidden
            width={14.3333}
            height={17.7734}
            className="absolute left-[2.83px] top-[1.17px] max-w-none"
          />
        </span>
      </p>
    </div>
  );
}

export default function Hero() {
  return (
    <section className="relative h-[760px] w-full overflow-clip bg-black">
      <TableScene />

      {/* desktop */}
      <div className="absolute left-1/2 top-0 hidden h-full w-[1280px] -translate-x-1/2 lg:block">
        <div className="absolute left-[116px] top-[115px]">
          <Wordmark className="text-[157.962px]" />
          <EventDetails date={"Wednesday, November 18  |  6:30-9:00 PM"} iconClassName="opacity-80" />
        </div>
        <Stars stars={desktopStars} />
      </div>

      {/* tablet */}
      <div className="absolute left-1/2 top-0 hidden h-full w-[744px] -translate-x-1/2 sm:block lg:hidden">
        <div className="absolute left-[75px] top-[42.34px]">
          <Wordmark className="text-[138.93px]" />
          <EventDetails date={"Wednesday, November 18  |  6:30-9:00 PM"} iconClassName="opacity-80" />
        </div>
        <Stars stars={tabletStars} />
      </div>

      {/* mobile */}
      <div className="absolute left-1/2 top-0 h-full w-[390px] -translate-x-1/2 sm:hidden">
        <div className="absolute left-[36px] top-[275px] flex flex-col gap-[2px]">
          <Wordmark className="text-[95.5px]" />
          <EventDetails date={"Wed, November 18  |  6:30-9:00 PM"} />
        </div>
        <Stars stars={mobileStars} />
      </div>
    </section>
  );
}
