import { CategoryModel } from "../../data";
import {
  CreateCategoryDto,
  CustomError,
  PaginationDto,
  UserEntity,
} from "../../domain";

export class CategoryService {
  constructor() {}

  async createCategory(createCategoryDto: CreateCategoryDto, user: UserEntity) {
    const categoryExist = await CategoryModel.findOne({
      name: createCategoryDto.name,
    });

    if (categoryExist) throw CustomError.badRequest("Category already exist");

    try {
      const category = new CategoryModel({
        ...createCategoryDto,
        user: user.id,
      });

      await category.save();

      return {
        id: category.id,
        name: category.name,
        available: category.available,
      };
    } catch (error) {
      throw CustomError.internalServer();
    }
  }

  async getCategories(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;

    try {
      const [total, categories] = await Promise.all([
        CategoryModel.countDocuments(),
        CategoryModel.find({}, "id name available")
          .skip((page - 1) * limit)
          .limit(limit),
      ]);

      return [
        {
          page,
          limit,
          total,
          next: `/api/categories?page=${page + 1}&limit=${limit}`,
          prev:
            page - 1 > 0
              ? `/api/categories?page=${page - 1}&limit=${limit}`
              : null,
          categories: { ...categories },
        },
      ];
    } catch (error) {
      throw CustomError.internalServer();
    }
  }
}
