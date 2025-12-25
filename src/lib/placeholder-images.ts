import data from './placeholder-images.json';
import { Testimonial } from './types';

export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
  data?: Testimonial;
};

export const PlaceHolderImages: ImagePlaceholder[] = data.placeholderImages;
