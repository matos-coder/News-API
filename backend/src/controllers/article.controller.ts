import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { catchAsync } from '../utils/catchAsync';
import { successResponse, errorResponse, paginatedResponse } from '../utils/response';
import { prisma } from '../config/db';

export const createArticle = catchAsync(async (req: AuthRequest, res: Response) => {
  const { title, content, category, status } = req.body;
  const authorId = req.user!.sub;

  const article = await prisma.article.create({
    data: { title, content, category, status: status || 'Draft', authorId }
  });

  res.status(201).json(successResponse("Article created successfully", article));
});

export const updateArticle = catchAsync(async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  const authorId = req.user!.sub;
  const updateData = req.body;

  const article = await prisma.article.findUnique({ where: { id } });
  
  if (!article || article.deletedAt) {
    return res.status(404).json(errorResponse("Article not found"));
  }
  if (article.authorId !== authorId) {
    return res.status(403).json(errorResponse("Forbidden: You cannot modify another author's work"));
  }

  const updatedArticle = await prisma.article.update({
    where: { id },
    data: updateData
  });

  res.json(successResponse("Article updated successfully", updatedArticle));
});

export const deleteArticle = catchAsync(async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  const authorId = req.user!.sub;

  const article = await prisma.article.findUnique({ where: { id } });
  
  if (!article || article.deletedAt) {
    return res.status(404).json(errorResponse("Article not found"));
  }
  if (article.authorId !== authorId) {
    return res.status(403).json(errorResponse("Forbidden: You cannot delete another author's work"));
  }

  await prisma.article.update({
    where: { id },
    data: { deletedAt: new Date() }
  });

  res.json(successResponse("Article deleted successfully"));
});

export const getMyArticles = catchAsync(async (req: AuthRequest, res: Response) => {
  const authorId = req.user!.sub;
  
  const articles = await prisma.article.findMany({
    where: { authorId },
    orderBy: { createdAt: 'desc' }
  });

  res.json(successResponse("Your articles retrieved", articles));
});


export const getPublicArticles = catchAsync(async (req: AuthRequest, res: Response) => {
  const { page, size, category, author, q } = req.query as any;
  const skip = (page - 1) * size;

  const whereClause: any = {
    status: 'Published',
    deletedAt: null,
  };

  if (category) whereClause.category = category;
  if (q) whereClause.title = { contains: q, mode: 'insensitive' };
  if (author) whereClause.author = { name: { contains: author, mode: 'insensitive' } };

  const [total, articles] = await prisma.$transaction([
    prisma.article.count({ where: whereClause }),
    prisma.article.findMany({
      where: whereClause,
      skip,
      take: size,
      include: { author: { select: { name: true } } },
      orderBy: { createdAt: 'desc' }
    })
  ]);

  res.json(paginatedResponse("Articles retrieved successfully", articles, page, size, total));
});

export const getArticleDetails = catchAsync(async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  const readerId = req.user?.sub || null;

  const article = await prisma.article.findUnique({
    where: { id },
    include: { author: { select: { name: true } } }
  });

  if (!article || article.deletedAt) {
    return res.json({ Success: false, Message: "News article no longer available", Object: null, Errors: null });
  }
  prisma.readLog.create({
    data: { articleId: id, readerId }
  }).catch((err: any) => console.error("Failed to track read log:", err));

  res.json(successResponse("Article retrieved", article));
});


export const getAuthorDashboard = catchAsync(async (req: AuthRequest, res: Response) => {
  const authorId = req.user!.sub;

  const articles = await prisma.article.findMany({
    where: { authorId, deletedAt: null },
    select: { 
      id: true, 
      title: true, 
      createdAt: true,
      dailyAnalytics: { select: { viewCount: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  // Calculate total views for each article
  const dashboardData = articles.map(article => ({
    title: article.title,
    createdAt: article.createdAt,
    TotalViews: article.dailyAnalytics.reduce((sum, record) => sum + record.viewCount, 0)
  }));

  res.json(successResponse("Author Dashboard retrieved", dashboardData));
});