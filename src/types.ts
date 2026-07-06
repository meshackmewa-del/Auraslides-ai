export interface Slide {
  title: string;
  body: string;
}

export type SlideTheme = "light" | "dark" | "vibrant";

export interface GenerateSlidesRequest {
  text: string;
}

export interface GenerateSlidesResponse {
  slides: Slide[];
}
