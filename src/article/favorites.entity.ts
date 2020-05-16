import { Entity, PrimaryColumn } from 'typeorm';

@Entity('favorites')
export class FavoritesEntity {
  @PrimaryColumn()
  articleId: number;

  @PrimaryColumn()
  favoritedBy: number; // this column would hold the user id
}
