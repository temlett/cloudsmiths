export interface BreedOption {
  id: string
  label: string
  value: string
  subBreeds: string[]
}

export interface DogApiListResponse {
  message: Record<string, string[]>
  status: 'success' | 'error'
}

export interface DogApiImagesResponse {
  message: string[]
  status: 'success' | 'error'
}
