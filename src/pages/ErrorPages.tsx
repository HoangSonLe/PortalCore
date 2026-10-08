import { Button, Result } from 'antd';
import { useNavigate } from 'react-router';

import { useT } from '../core/hooks';

const BackHomeButton = () => {
  const t = useT();
  const navigate = useNavigate();

  return (
    <Button type="primary" onClick={() => navigate('/')}>
      {t('error.backHome')}
    </Button>
  );
};

export const NotFoundPage = () => {
  const t = useT();

  return (
    <Result
      status="404"
      title={t('error.notFound.title')}
      subTitle={t('error.notFound.description')}
      extra={<BackHomeButton />}
    />
  );
};

export const ForbiddenPage = () => {
  const t = useT();

  return (
    <Result
      status="403"
      title={t('error.forbidden.title')}
      subTitle={t('error.forbidden.description')}
      extra={<BackHomeButton />}
    />
  );
};
