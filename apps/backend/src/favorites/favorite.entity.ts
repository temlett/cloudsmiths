import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity({ name: "favorites" })
export class FavoriteEntity {
  @PrimaryColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 255 })
  breed!: string;

  @Column({ type: "varchar", length: 255 })
  label!: string;

  @Column({ type: "text", unique: true })
  imageUrl!: string;

  @Column({ type: "timestamptz" })
  createdAt!: Date;
}
