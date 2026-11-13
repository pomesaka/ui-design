import type { ComponentProps, ReactElement } from "react";
import styles from "./afterlight.module.css";

type PhotoAfterlightProps = Omit<ComponentProps<"div">, "children"> & {
  enabled?: boolean;
  size?: "photo" | "thumbnail";
  /** `contain` expects a sized query container around the photograph. */
  fit?: "cover" | "contain";
  loading?: ComponentProps<"img">["loading"];
} & (
    | { src: string; alt: string; children?: never }
    | { src: string | null; children: ReactElement; alt?: never }
  );

/**
 * A photograph whose own colours spill softly onto the surface around it.
 * Pass `src` and `alt` for a plain image, or wrap a gallery as `children`
 * and pass the `src` to diffuse behind it.
 */
export function PhotoAfterlight({ src, alt, children, enabled = false, size = "photo", fit = "cover", loading, className, ...divProps }: PhotoAfterlightProps) {
  return (
    <div
      {...divProps}
      className={[styles.photo, className].filter(Boolean).join(" ")}
      data-enabled={enabled}
      data-size={size}
      data-layout={children ? "content" : "image"}
      data-fit={fit}
    >
      {src !== null ? <img src={src} alt="" aria-hidden="true" className={styles.afterlight} loading={loading} /> : null}
      {children ? (
        <div className={styles.foreground}>{children}</div>
      ) : src !== null ? (
        <img src={src} alt={alt} className={styles.image} loading={loading} />
      ) : null}
    </div>
  );
}
