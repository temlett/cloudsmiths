export interface FavoriteImage {
  id: string;
  breed: string;
  label: string;
  imageUrl: string;
  createdAt: string;
}

export interface FavoriteImageDto {
  breed: string;
  label: string;
  imageUrl: string;
}
