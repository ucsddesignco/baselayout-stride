import Image from "next/image";
import HeroIntro from "./HeroIntro";
import PoolTable from "./PoolTable";

// Star decorations, positioned on the 1280×760 hero stage.
// `inset` is the star's offset within its square bounding box.
const STAR_INSET_LG = "inset-[8.23%_8.82%_10.56%_8.82%]";
const STAR_INSET_SM = "inset-[8.9%_9.47%_11.18%_9.47%]";

const stars = [
  { src: "/hero/star-red.svg", w: 29.9892, h: 29.5714, box: "left-[89px] top-[103px] size-[37px]", inset: STAR_INSET_SM },
  { src: "/hero/star-red.svg", w: 29.9892, h: 29.5714, box: "left-[857px] top-[275px] size-[37px]", inset: STAR_INSET_SM },
  { src: "/hero/star-yellow-2.svg", w: 50.239, h: 49.5335, box: "left-[670px] top-[103px] size-[61px]", inset: STAR_INSET_LG },
  { src: "/hero/star-yellow-1.svg", w: 50.239, h: 49.5335, box: "left-[251px] top-[613px] size-[61px]", inset: STAR_INSET_LG },
  { src: "/hero/star-blue.svg", w: 75.7703, h: 74.7063, box: "left-[1057px] top-[140px] size-[92px]", inset: STAR_INSET_LG },
  { src: "/hero/star-blue.svg", w: 75.7703, h: 74.7063, box: "left-[-44px] top-[421px] size-[92px]", inset: STAR_INSET_LG },
];

export default function Hero() {
  return (
    <section className="relative w-full overflow-clip bg-black">
      <div className="relative mx-auto h-[760px] w-[1280px]">
        <HeroIntro>
          {/* wordmark */}
          <h1 data-hero-text className="absolute left-[365px] top-[348px] -translate-x-1/2 -translate-y-full whitespace-nowrap text-center font-display text-[157.962px] leading-normal text-cream opacity-0">
            Stride
          </h1>
          <Image
            data-hero-text
            src="/hero/stride-dot.svg"
            alt=""
            aria-hidden
            width={41.6614}
            height={41.6614}
            className="absolute left-[359.91px] top-[181.79px] size-[41.661px] max-w-none opacity-0"
          />

          <p data-hero-text className="absolute left-[364px] top-[368px] -translate-x-1/2 -translate-y-full whitespace-nowrap text-center font-display text-[21.016px] leading-normal text-cream opacity-0">
            Design Expo blah blah blah WORDS WORDS
          </p>

          {/* table light (flickers on) */}
          <div data-hero-light className="absolute inset-0 opacity-[0.08] brightness-30">
            <PoolTable />

            {/* pool cue (slides in with its shadow in PoolTable) */}
            <div data-hero-cue className="absolute left-[737px] top-[438.98px] opacity-0">
              <Image
                src="/hero/cue.svg"
                alt=""
                aria-hidden
                width={696.486}
                height={105.807}
                className="block max-w-none"
              />
            </div>
          </div>

          {/* stars */}
          {stars.map((star, i) => (
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
          ))}
        </HeroIntro>
      </div>
    </section>
  );
}
