import { Router } from 'express';
import { 
  createArticle, updateArticle, deleteArticle, getMyArticles, 
  getPublicArticles, getArticleDetails 
} from '../controllers/article.controller';
import { authenticate, authorizeRole, optionalAuth } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validate';
import { articleSchema, articleQuerySchema } from '../validations/article.validation';

const router = Router();

router.get('/', validate(articleQuerySchema), getPublicArticles);
router.get('/:id', optionalAuth, getArticleDetails);

router.use(authenticate, authorizeRole('author'));

router.post('/', validate(articleSchema), createArticle);
router.get('/author/me', getMyArticles);
router.put('/:id', validate(articleSchema), updateArticle);
router.delete('/:id', deleteArticle);

export default router;